package service

import "testing"

// histogramOverflowBound is the sentinel bucket used by the aggregator for
// "anything larger"; a median landing there is not publishable.
const testOverflowBound = int64(2147483647)

func TestMedianUpperBound_EmptyInput(t *testing.T) {
	if _, ok := MedianUpperBound(nil); ok {
		t.Fatal("want ok=false for nil input")
	}
	if _, ok := MedianUpperBound([]HistogramBucket{}); ok {
		t.Fatal("want ok=false for empty input")
	}
}

func TestMedianUpperBound_AllSamplesZero(t *testing.T) {
	in := []HistogramBucket{{UpperBoundMs: 50, SampleCount: 0}, {UpperBoundMs: 100, SampleCount: 0}}
	if _, ok := MedianUpperBound(in); ok {
		t.Fatal("want ok=false when every bucket is empty")
	}
}

func TestMedianUpperBound_SingleBucket(t *testing.T) {
	in := []HistogramBucket{{UpperBoundMs: 500, SampleCount: 7}}
	got, ok := MedianUpperBound(in)
	if !ok || got != 500 {
		t.Fatalf("want (500,true), got (%d,%v)", got, ok)
	}
}

func TestMedianUpperBound_CrossesInSecondBucket(t *testing.T) {
	// total=10, half=5. cumulative: 50→3, 100→8 ≥ 5 ⇒ 100
	in := []HistogramBucket{
		{UpperBoundMs: 50, SampleCount: 3},
		{UpperBoundMs: 100, SampleCount: 5},
		{UpperBoundMs: 250, SampleCount: 2},
	}
	got, ok := MedianUpperBound(in)
	if !ok || got != 100 {
		t.Fatalf("want (100,true), got (%d,%v)", got, ok)
	}
}

func TestMedianUpperBound_ExactBoundaryStaysInLowerBucket(t *testing.T) {
	// total=10, half=5. cumulative: 50→5 ≥ 5 ⇒ 50, not 100.
	in := []HistogramBucket{
		{UpperBoundMs: 50, SampleCount: 5},
		{UpperBoundMs: 100, SampleCount: 5},
	}
	got, ok := MedianUpperBound(in)
	if !ok || got != 50 {
		t.Fatalf("want (50,true), got (%d,%v)", got, ok)
	}
}

func TestMedianUpperBound_OddTotal(t *testing.T) {
	// total=7, half=3.5 ⇒ need cumulative ≥ 3.5. 50→3 (<3.5), 100→7 ⇒ 100
	in := []HistogramBucket{
		{UpperBoundMs: 50, SampleCount: 3},
		{UpperBoundMs: 100, SampleCount: 4},
	}
	got, ok := MedianUpperBound(in)
	if !ok || got != 100 {
		t.Fatalf("want (100,true), got (%d,%v)", got, ok)
	}
}

func TestMedianUpperBound_SortsUnorderedInput(t *testing.T) {
	in := []HistogramBucket{
		{UpperBoundMs: 250, SampleCount: 2},
		{UpperBoundMs: 50, SampleCount: 3},
		{UpperBoundMs: 100, SampleCount: 5},
	}
	got, ok := MedianUpperBound(in)
	if !ok || got != 100 {
		t.Fatalf("want (100,true), got (%d,%v)", got, ok)
	}
}

func TestMedianUpperBound_OverflowBucketIsNotPublishable(t *testing.T) {
	in := []HistogramBucket{
		{UpperBoundMs: 1000, SampleCount: 1},
		{UpperBoundMs: testOverflowBound, SampleCount: 9},
	}
	if _, ok := MedianUpperBound(in); ok {
		t.Fatal("want ok=false when median lands in the overflow bucket")
	}
}

func TestMedianUpperBound_IgnoresNegativeCounts(t *testing.T) {
	in := []HistogramBucket{
		{UpperBoundMs: 50, SampleCount: -5},
		{UpperBoundMs: 100, SampleCount: 4},
	}
	got, ok := MedianUpperBound(in)
	if !ok || got != 100 {
		t.Fatalf("want (100,true), got (%d,%v)", got, ok)
	}
}
