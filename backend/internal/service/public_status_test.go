package service

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"
)

type stubPublicStatusSettingRepo struct {
	SettingRepository
	vals map[string]string
	err  error
}

func (s *stubPublicStatusSettingRepo) GetMultiple(_ context.Context, keys []string) (map[string]string, error) {
	if s.err != nil {
		return nil, s.err
	}
	out := make(map[string]string, len(keys))
	for _, k := range keys {
		out[k] = s.vals[k]
	}
	return out, nil
}

func TestGetPublicStatusRuntime_EnabledWhenTrue(t *testing.T) {
	s := &SettingService{settingRepo: &stubPublicStatusSettingRepo{vals: map[string]string{
		SettingKeyPublicStatusEnabled: "true",
	}}}
	if got := s.GetPublicStatusRuntime(context.Background()); !got.Enabled {
		t.Fatalf("want Enabled=true, got %+v", got)
	}
}

func TestGetPublicStatusRuntime_FailClosedOnRepoError(t *testing.T) {
	s := &SettingService{settingRepo: &stubPublicStatusSettingRepo{err: errors.New("db down")}}
	if got := s.GetPublicStatusRuntime(context.Background()); got.Enabled {
		t.Fatalf("want fail-closed Enabled=false, got %+v", got)
	}
}

func TestGetPublicStatusRuntime_DisabledWhenUnset(t *testing.T) {
	s := &SettingService{settingRepo: &stubPublicStatusSettingRepo{vals: map[string]string{}}}
	if got := s.GetPublicStatusRuntime(context.Background()); got.Enabled {
		t.Fatalf("want Enabled=false when key missing, got %+v", got)
	}
}

type fakeStatusRepo struct {
	uptimeCalls atomic.Int64
	ttftCalls   atomic.Int64
	ok, total   int64
	buckets     []HistogramBucket
	uptimeErr   error
}

func (f *fakeStatusRepo) UptimeRatio(_ context.Context, _ time.Time) (int64, int64, error) {
	f.uptimeCalls.Add(1)
	return f.ok, f.total, f.uptimeErr
}

func (f *fakeStatusRepo) TTFTHistogram(_ context.Context, _ time.Time) ([]HistogramBucket, error) {
	f.ttftCalls.Add(1)
	return f.buckets, nil
}

func TestPublicStatus_ComputesRatioAndMedian(t *testing.T) {
	repo := &fakeStatusRepo{ok: 9993, total: 10000, buckets: []HistogramBucket{
		{UpperBoundMs: 500, SampleCount: 4},
		{UpperBoundMs: 1000, SampleCount: 6},
	}}
	svc := NewPublicStatusService(repo, time.Now)

	got, err := svc.Get(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.UptimeRatio == nil || *got.UptimeRatio != 0.9993 {
		t.Fatalf("want uptime 0.9993, got %v", got.UptimeRatio)
	}
	if got.TTFTUpperBoundMs == nil || *got.TTFTUpperBoundMs != 1000 {
		t.Fatalf("want ttft 1000, got %v", got.TTFTUpperBoundMs)
	}
}

func TestPublicStatus_NilNotZeroWhenNoSamples(t *testing.T) {
	repo := &fakeStatusRepo{ok: 0, total: 0, buckets: nil}
	svc := NewPublicStatusService(repo, time.Now)

	got, err := svc.Get(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.UptimeRatio != nil {
		t.Fatalf("want nil uptime when no checks, got %v", *got.UptimeRatio)
	}
	if got.TTFTUpperBoundMs != nil {
		t.Fatalf("want nil ttft when no samples, got %v", *got.TTFTUpperBoundMs)
	}
}

func TestPublicStatus_CachesForSixtySeconds(t *testing.T) {
	repo := &fakeStatusRepo{ok: 1, total: 1}
	base := time.Date(2026, 8, 16, 4, 0, 0, 0, time.UTC)
	clock := base
	svc := NewPublicStatusService(repo, func() time.Time { return clock })

	for i := 0; i < 100; i++ {
		if _, err := svc.Get(context.Background()); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
	if n := repo.uptimeCalls.Load(); n != 1 {
		t.Fatalf("want exactly 1 db read inside the window, got %d", n)
	}

	clock = base.Add(61 * time.Second)
	if _, err := svc.Get(context.Background()); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if n := repo.uptimeCalls.Load(); n != 2 {
		t.Fatalf("want a refresh after the window, got %d reads", n)
	}
}
