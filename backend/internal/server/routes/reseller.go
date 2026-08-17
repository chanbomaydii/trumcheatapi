package routes

import (
	"github.com/Wei-Shaw/sub2api/internal/handler"
	"github.com/Wei-Shaw/sub2api/internal/server/middleware"
	"github.com/Wei-Shaw/sub2api/internal/service"
	"github.com/gin-gonic/gin"
)

func RegisterResellerRoutes(v1 *gin.RouterGroup, h *handler.Handlers, jwtAuth middleware.JWTAuthMiddleware, auditLog middleware.AuditLogMiddleware, settingService *service.SettingService, panelRateLimiter *middleware.PanelRateLimiter) {
	reseller := v1.Group("/reseller")
	reseller.Use(gin.HandlerFunc(jwtAuth), middleware.BackendModeUserGuard(settingService), panelRateLimiter.Global(), gin.HandlerFunc(auditLog), middleware.ResellerOnly())
	{
		reseller.GET("/profile", h.Reseller.Profile)
		reseller.GET("/users", h.Reseller.ListUsers)
		reseller.GET("/users/:id", h.Reseller.GetUser)
		reseller.GET("/users/:id/usage", panelRateLimiter.Heavy(), h.Reseller.UserUsage)
		reseller.POST("/users/:id/transfer", h.Reseller.TransferBalance)
		registerResellerCodeRoutes(reseller.Group("/codes"), h)
		registerResellerCodeRoutes(reseller.Group("/cdkeys"), h)
	}
}

func registerResellerCodeRoutes(codes *gin.RouterGroup, h *handler.Handlers) {
	codes.GET("", h.Reseller.ListCDKeys)
	codes.POST("", h.Reseller.CreateCDKeys)
	codes.GET("/export", h.Reseller.ExportCDKeys)
	codes.GET("/:id", h.Reseller.GetCDKey)
}
