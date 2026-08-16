//go:build unit

package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/config"
	"github.com/Wei-Shaw/sub2api/internal/service"

	"github.com/gin-gonic/gin"
)

// The response must never carry volume figures. Listed explicitly so that adding
// a field to the DTO without thinking breaks this test.
var forbiddenPublicStatusFields = []string{
	"sample_count", "samples", "total_checks", "ok_count",
	"request_count", "requests", "user_count", "accounts",
}

// publicStatusStub describes the fixed state a test wants the handler to see:
// whether the feature switch is on, and what the status service should return.
type publicStatusStub struct {
	enabled bool
	ratio   *float64
	ttft    *int64
}

// publicStatusStubReader is a fixed-value stand-in for *service.PublicStatusService,
// satisfying the narrow publicStatusReader interface so tests don't need a database.
type publicStatusStubReader struct {
	status service.PublicStatus
}

func (r publicStatusStubReader) Get(ctx context.Context) (service.PublicStatus, error) {
	return r.status, nil
}

// publicStatusSettingRepoStub implements service.SettingRepository so a real
// *service.SettingService can be constructed without a database (mirrors the
// pattern in setting_handler_public_test.go).
type publicStatusSettingRepoStub struct {
	enabled bool
}

func (s *publicStatusSettingRepoStub) Get(ctx context.Context, key string) (*service.Setting, error) {
	panic("unexpected Get call")
}

func (s *publicStatusSettingRepoStub) GetValue(ctx context.Context, key string) (string, error) {
	panic("unexpected GetValue call")
}

func (s *publicStatusSettingRepoStub) Set(ctx context.Context, key, value string) error {
	panic("unexpected Set call")
}

func (s *publicStatusSettingRepoStub) GetMultiple(ctx context.Context, keys []string) (map[string]string, error) {
	out := make(map[string]string, len(keys))
	for _, key := range keys {
		if key == service.SettingKeyPublicStatusEnabled && s.enabled {
			out[key] = "true"
		}
	}
	return out, nil
}

func (s *publicStatusSettingRepoStub) SetMultiple(ctx context.Context, settings map[string]string) error {
	panic("unexpected SetMultiple call")
}

func (s *publicStatusSettingRepoStub) GetAll(ctx context.Context) (map[string]string, error) {
	panic("unexpected GetAll call")
}

func (s *publicStatusSettingRepoStub) Delete(ctx context.Context, key string) error {
	panic("unexpected Delete call")
}

// publicStatusTestContext bundles the handler under test with the gin context it
// runs against, so test bodies read as `c.handler.Get(c.ctx)`.
type publicStatusTestContext struct {
	handler *PublicStatusHandler
	ctx     *gin.Context
}

func newPublicStatusTestContext(w *httptest.ResponseRecorder, stub publicStatusStub) publicStatusTestContext {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/v1/public/status", nil)

	settingService := service.NewSettingService(&publicStatusSettingRepoStub{enabled: stub.enabled}, &config.Config{})
	h := &PublicStatusHandler{
		statusService: publicStatusStubReader{status: service.PublicStatus{
			UptimeRatio:      stub.ratio,
			UptimeWindowDays: 30,
			TTFTUpperBoundMs: stub.ttft,
			TTFTWindowHours:  24,
			ComputedAt:       time.Date(2026, 8, 16, 0, 0, 0, 0, time.UTC),
		}},
		settingService: settingService,
	}
	return publicStatusTestContext{handler: h, ctx: c}
}

func TestPublicStatusHandler_NotFoundWhenSwitchOff(t *testing.T) {
	w := httptest.NewRecorder()
	c := newPublicStatusTestContext(w, publicStatusStub{enabled: false})

	c.handler.Get(c.ctx)

	if w.Code != http.StatusNotFound {
		t.Fatalf("want 404 when disabled, got %d", w.Code)
	}
}

func TestPublicStatusHandler_OmitsVolumeFields(t *testing.T) {
	w := httptest.NewRecorder()
	ratio := 0.9993
	bound := int64(1000)
	c := newPublicStatusTestContext(w, publicStatusStub{
		enabled: true, ratio: &ratio, ttft: &bound,
	})

	c.handler.Get(c.ctx)

	if w.Code != http.StatusOK {
		t.Fatalf("want 200, got %d", w.Code)
	}
	body := w.Body.String()
	for _, field := range forbiddenPublicStatusFields {
		if strings.Contains(body, field) {
			t.Fatalf("response leaks business-volume field %q: %s", field, body)
		}
	}
	var parsed map[string]any
	if err := json.Unmarshal([]byte(body), &parsed); err != nil {
		t.Fatalf("response is not valid JSON: %v", err)
	}
}

func TestPublicStatusHandler_NullWhenNoData(t *testing.T) {
	w := httptest.NewRecorder()
	c := newPublicStatusTestContext(w, publicStatusStub{enabled: true, ratio: nil, ttft: nil})

	c.handler.Get(c.ctx)

	body := w.Body.String()
	if strings.Contains(body, `"ratio":0`) {
		t.Fatalf("missing data must serialise as null, not 0: %s", body)
	}
	if !strings.Contains(body, "null") {
		t.Fatalf("want null for missing metrics, got: %s", body)
	}
}
