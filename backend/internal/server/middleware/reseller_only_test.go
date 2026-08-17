package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Wei-Shaw/sub2api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestResellerOnly(t *testing.T) {
	gin.SetMode(gin.TestMode)
	for _, test := range []struct {
		role string
		want int
	}{{service.RoleReseller, http.StatusNoContent}, {service.RoleUser, http.StatusForbidden}, {service.RoleAdmin, http.StatusForbidden}, {service.RoleRoot, http.StatusForbidden}} {
		t.Run(test.role, func(t *testing.T) {
			router := gin.New()
			router.Use(func(c *gin.Context) { c.Set(string(ContextKeyUserRole), test.role) }, ResellerOnly())
			router.GET("/", func(c *gin.Context) { c.Status(http.StatusNoContent) })
			response := httptest.NewRecorder()
			router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/", nil))
			require.Equal(t, test.want, response.Code)
		})
	}
}
