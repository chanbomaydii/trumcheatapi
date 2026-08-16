package service

import (
	"context"
	"math"
	"sync"
	"time"
)

// PublicStatusRepository reads the pre-aggregated tables that back the public
// status endpoint. It never touches usage_logs directly — the landing page is
// public and must not be able to drive a scan of the request log.
type PublicStatusRepository interface {
	// UptimeRatio sums synthetic-probe outcomes from channel_monitor_daily_rollups.
	UptimeRatio(ctx context.Context, since time.Time) (okCount int64, totalChecks int64, err error)
	// TTFTHistogram returns the all-audience (user_id = 0) time-to-first-token
	// ladder from channel_monitor_v2_latency_histograms_1m.
	TTFTHistogram(ctx context.Context, since time.Time) ([]HistogramBucket, error)
}

const (
	publicStatusUptimeWindowDays = 30
	publicStatusTTFTWindowHours  = 24
	publicStatusCacheTTL         = 60 * time.Second
)

// PublicStatus is the anonymised view served to the landing page. Every field is
// a ratio or a bound — deliberately no sample counts, request counts, or any
// other figure that would leak business volume to competitors.
type PublicStatus struct {
	UptimeRatio      *float64
	UptimeWindowDays int
	TTFTUpperBoundMs *int64
	TTFTWindowHours  int
	ComputedAt       time.Time
}

// PublicStatusService computes PublicStatus at most once per cache window.
type PublicStatusService struct {
	repo PublicStatusRepository
	now  func() time.Time

	mu       sync.Mutex
	cached   PublicStatus
	cachedAt time.Time
	hasValue bool
}

func NewPublicStatusService(repo PublicStatusRepository, now func() time.Time) *PublicStatusService {
	if now == nil {
		now = time.Now
	}
	return &PublicStatusService{repo: repo, now: now}
}

// Get returns the cached status, recomputing when the window has elapsed.
//
// The whole recompute happens under the mutex on purpose: the landing page is
// public, so a cache expiry must not let a burst of crawler hits turn into a
// burst of identical queries.
func (s *PublicStatusService) Get(ctx context.Context) (PublicStatus, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := s.now()
	if s.hasValue && now.Sub(s.cachedAt) < publicStatusCacheTTL {
		return s.cached, nil
	}

	status, err := s.compute(ctx, now)
	if err != nil {
		return PublicStatus{}, err
	}
	s.cached = status
	s.cachedAt = now
	s.hasValue = true
	return status, nil
}

func (s *PublicStatusService) compute(ctx context.Context, now time.Time) (PublicStatus, error) {
	status := PublicStatus{
		UptimeWindowDays: publicStatusUptimeWindowDays,
		TTFTWindowHours:  publicStatusTTFTWindowHours,
		ComputedAt:       now.UTC(),
	}

	uptimeSince := now.UTC().AddDate(0, 0, -publicStatusUptimeWindowDays)
	okCount, totalChecks, err := s.repo.UptimeRatio(ctx, uptimeSince)
	if err != nil {
		return PublicStatus{}, err
	}
	if totalChecks > 0 {
		// Round to four decimals: the tile renders two ("99,93%"), and carrying
		// more precision than we display invites false confidence.
		ratio := math.Round(float64(okCount)/float64(totalChecks)*10000) / 10000
		status.UptimeRatio = &ratio
	}

	ttftSince := now.UTC().Add(-publicStatusTTFTWindowHours * time.Hour)
	buckets, err := s.repo.TTFTHistogram(ctx, ttftSince)
	if err != nil {
		return PublicStatus{}, err
	}
	if bound, ok := MedianUpperBound(buckets); ok {
		status.TTFTUpperBoundMs = &bound
	}

	return status, nil
}
