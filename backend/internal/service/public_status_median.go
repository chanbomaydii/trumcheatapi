package service

import "sort"

// HistogramOverflowBoundMs is the sentinel upper bound the channel-monitor v2
// aggregator writes for "anything larger than the top ladder rung". A median
// landing here carries no usable magnitude, so it is never published.
const HistogramOverflowBoundMs int64 = 2147483647

// HistogramBucket is one rung of the latency ladder written by the
// channel-monitor v2 aggregator into channel_monitor_v2_latency_histograms_1m.
type HistogramBucket struct {
	UpperBoundMs int64
	SampleCount  int64
}

// MedianUpperBound walks a latency histogram and returns the upper bound of the
// bucket containing the median sample.
//
// The returned value is a ladder rung, not a millisecond-accurate measurement:
// callers must present it as an upper bound ("< 1.0 s"), never as an exact
// figure, and must not interpolate inside the bucket.
//
// Returns ok=false when there are no samples, or when the median falls into the
// overflow bucket (magnitude unknown).
func MedianUpperBound(buckets []HistogramBucket) (int64, bool) {
	var total int64
	for _, b := range buckets {
		if b.SampleCount > 0 {
			total += b.SampleCount
		}
	}
	if total == 0 {
		return 0, false
	}

	ordered := make([]HistogramBucket, len(buckets))
	copy(ordered, buckets)
	sort.Slice(ordered, func(i, j int) bool {
		return ordered[i].UpperBoundMs < ordered[j].UpperBoundMs
	})

	// Median position: the smallest rung whose cumulative count reaches half the
	// samples. Doubling instead of halving keeps this in integer arithmetic, so
	// an odd total rounds the same way every time.
	var cumulative int64
	for _, b := range ordered {
		if b.SampleCount <= 0 {
			continue
		}
		cumulative += b.SampleCount
		if cumulative*2 >= total {
			if b.UpperBoundMs >= HistogramOverflowBoundMs {
				return 0, false
			}
			return b.UpperBoundMs, true
		}
	}
	return 0, false
}
