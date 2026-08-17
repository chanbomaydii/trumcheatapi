package middleware

import (
	"github.com/Wei-Shaw/sub2api/internal/service"

	"github.com/gin-gonic/gin"
)

// AdminOnly allows roles that can access the administration panel.
// 必须在JWTAuth中间件之后使用
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, ok := GetUserRoleFromContext(c)
		if !ok {
			AbortWithError(c, 401, "UNAUTHORIZED", "User not found in context")
			return
		}

		if role != service.RoleRoot && role != service.RoleAdmin {
			AbortWithError(c, 403, "FORBIDDEN", "Admin access required")
			return
		}

		c.Next()
	}
}

// RootOnly restricts sensitive operations to the unrestricted root role.
func RootOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, ok := GetUserRoleFromContext(c)
		if !ok {
			AbortWithError(c, 401, "UNAUTHORIZED", "User not found in context")
			return
		}
		if role != service.RoleRoot {
			AbortWithError(c, 403, "FORBIDDEN", "Root access required")
			return
		}
		c.Next()
	}
}

// ResellerOnly restricts the reseller API to the authenticated reseller role.
func ResellerOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, ok := GetUserRoleFromContext(c)
		if !ok {
			AbortWithError(c, 401, "UNAUTHORIZED", "User not found in context")
			return
		}
		if role != service.RoleReseller {
			AbortWithError(c, 403, "FORBIDDEN", "Reseller access required")
			return
		}
		c.Next()
	}
}
