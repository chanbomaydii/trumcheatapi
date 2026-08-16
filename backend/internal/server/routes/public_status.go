package routes

import (
	"github.com/Wei-Shaw/sub2api/internal/handler"
	"github.com/Wei-Shaw/sub2api/internal/server/middleware"
	"github.com/Wei-Shaw/sub2api/internal/service"

	"github.com/gin-gonic/gin"
)

// RegisterPublicStatusRoutes registers the landing-page status endpoint.
//
// Same guard stack as the model plaza: PublicIP rate limiting keeps crawlers
// from hammering it, OptionalJWT keeps it reachable anonymously, and the
// handler is fail-closed on the feature switch.
func RegisterPublicStatusRoutes(
	v1 *gin.RouterGroup,
	h *handler.Handlers,
	optionalJWT middleware.OptionalJWTAuthMiddleware,
	settingService *service.SettingService,
	panelRateLimiter *middleware.PanelRateLimiter,
) {
	status := v1.Group("/public/status")
	status.Use(panelRateLimiter.PublicIP())
	status.Use(gin.HandlerFunc(optionalJWT))
	status.Use(middleware.BackendModeUserGuard(settingService))
	{
		status.GET("", h.PublicStatus.Get)
	}
}
