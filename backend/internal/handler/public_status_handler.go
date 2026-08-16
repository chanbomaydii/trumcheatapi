package handler

import (
	"context"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/response"
	"github.com/Wei-Shaw/sub2api/internal/service"

	"github.com/gin-gonic/gin"
)

// publicStatusReader is the narrow slice of PublicStatusService the handler
// needs, so handler tests can run without a database.
type publicStatusReader interface {
	Get(ctx context.Context) (service.PublicStatus, error)
}

// PublicStatusHandler serves the anonymous landing-page status tiles.
//
// Deliberately minimal payload: ratios and bounds only. Sample counts, request
// counts and account counts are business-volume data and stay server-side.
type PublicStatusHandler struct {
	statusService  publicStatusReader
	settingService *service.SettingService
}

func NewPublicStatusHandler(
	statusService *service.PublicStatusService,
	settingService *service.SettingService,
) *PublicStatusHandler {
	return &PublicStatusHandler{statusService: statusService, settingService: settingService}
}

type publicStatusUptimeDTO struct {
	WindowDays int      `json:"window_days"`
	Ratio      *float64 `json:"ratio"`
}

type publicStatusTTFTDTO struct {
	WindowHours  int    `json:"window_hours"`
	UpperBoundMs *int64 `json:"upper_bound_ms"`
	// Bucketed is always true: the figure is a histogram ladder rung, and the
	// frontend must render it as "< X", never as an exact measurement.
	Bucketed bool `json:"bucketed"`
}

type publicStatusResponse struct {
	Uptime     publicStatusUptimeDTO `json:"uptime"`
	TTFT       publicStatusTTFTDTO   `json:"ttft"`
	ComputedAt string                `json:"computed_at"`
}

// Get returns the public status snapshot.
// GET /api/v1/public/status
func (h *PublicStatusHandler) Get(c *gin.Context) {
	if h.settingService == nil {
		response.NotFound(c, "Public status is not enabled")
		return
	}
	if !h.settingService.GetPublicStatusRuntime(c.Request.Context()).Enabled {
		response.NotFound(c, "Public status is not enabled")
		return
	}

	status, err := h.statusService.Get(c.Request.Context())
	if err != nil {
		response.ErrorFrom(c, err)
		return
	}

	response.Success(c, publicStatusResponse{
		Uptime: publicStatusUptimeDTO{
			WindowDays: status.UptimeWindowDays,
			Ratio:      status.UptimeRatio,
		},
		TTFT: publicStatusTTFTDTO{
			WindowHours:  status.TTFTWindowHours,
			UpperBoundMs: status.TTFTUpperBoundMs,
			Bucketed:     true,
		},
		ComputedAt: status.ComputedAt.Format(time.RFC3339),
	})
}
