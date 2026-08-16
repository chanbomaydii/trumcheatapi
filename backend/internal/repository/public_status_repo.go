package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/service"
)

type publicStatusRepository struct {
	db *sql.DB
}

// NewPublicStatusRepository wires the public status reads onto the shared pool.
func NewPublicStatusRepository(db *sql.DB) service.PublicStatusRepository {
	return &publicStatusRepository{db: db}
}

// bucket_date is indexed, so this stays an index range scan over at most 30
// days of pre-aggregated rows. bucket_date 需要 ::date 转型保证与 DATE 列一致比较。
const publicStatusUptimeSQL = `
SELECT COALESCE(SUM(ok_count), 0), COALESCE(SUM(total_checks), 0)
FROM channel_monitor_daily_rollups
WHERE bucket_date >= $1::date`

func (r *publicStatusRepository) UptimeRatio(ctx context.Context, since time.Time) (int64, int64, error) {
	if r == nil || r.db == nil {
		return 0, 0, fmt.Errorf("nil public status repository")
	}
	var okCount, totalChecks int64
	err := r.db.QueryRowContext(ctx, publicStatusUptimeSQL, since).Scan(&okCount, &totalChecks)
	if err != nil {
		return 0, 0, fmt.Errorf("query uptime rollups: %w", err)
	}
	return okCount, totalChecks, nil
}

// user_id = 0 is the aggregator's all-audience row: the histogram writer emits
// one row per request under the real user_id and one under 0, so filtering on 0
// counts every request exactly once.
const publicStatusTTFTSQL = `
SELECT upper_bound_ms, COALESCE(SUM(sample_count), 0)
FROM channel_monitor_v2_latency_histograms_1m
WHERE bucket_start >= $1 AND user_id = 0 AND metric = 'ttft'
GROUP BY upper_bound_ms
ORDER BY upper_bound_ms`

func (r *publicStatusRepository) TTFTHistogram(ctx context.Context, since time.Time) ([]service.HistogramBucket, error) {
	if r == nil || r.db == nil {
		return nil, fmt.Errorf("nil public status repository")
	}
	rows, err := r.db.QueryContext(ctx, publicStatusTTFTSQL, since)
	if err != nil {
		return nil, fmt.Errorf("query ttft histogram: %w", err)
	}
	defer func() { _ = rows.Close() }()

	var out []service.HistogramBucket
	for rows.Next() {
		var b service.HistogramBucket
		if err := rows.Scan(&b.UpperBoundMs, &b.SampleCount); err != nil {
			return nil, fmt.Errorf("scan ttft bucket: %w", err)
		}
		out = append(out, b)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate ttft buckets: %w", err)
	}
	return out, nil
}
