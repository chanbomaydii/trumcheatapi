package service

// Task 4 appends the service type here and will extend this import block.
import (
	"context"
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
