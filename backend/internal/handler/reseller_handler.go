package handler

import (
	"encoding/csv"
	"net/http"
	"strconv"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/pagination"
	"github.com/Wei-Shaw/sub2api/internal/pkg/response"
	"github.com/Wei-Shaw/sub2api/internal/server/middleware"
	"github.com/Wei-Shaw/sub2api/internal/service"
	"github.com/gin-gonic/gin"
)

type ResellerHandler struct {
	service *service.ResellerService
}

type resellerCDKey struct {
	ID        int64      `json:"id"`
	Code      string     `json:"code"`
	Value     float64    `json:"value"`
	Status    string     `json:"status"`
	UsedBy    *int64     `json:"used_by"`
	UsedAt    *time.Time `json:"used_at"`
	ExpiresAt *time.Time `json:"expires_at"`
	CreatedAt time.Time  `json:"created_at"`
}

func resellerCDKeys(codes []service.RedeemCode) []resellerCDKey {
	out := make([]resellerCDKey, 0, len(codes))
	for i := range codes {
		out = append(out, resellerCDKey{ID: codes[i].ID, Code: codes[i].Code, Value: codes[i].Value, Status: codes[i].Status, UsedBy: codes[i].UsedBy, UsedAt: codes[i].UsedAt, ExpiresAt: codes[i].ExpiresAt, CreatedAt: codes[i].CreatedAt})
	}
	return out
}

func NewResellerHandler(resellerService *service.ResellerService) *ResellerHandler {
	return &ResellerHandler{service: resellerService}
}

func resellerActor(c *gin.Context) (int64, bool) {
	subject, ok := middleware.GetAuthSubjectFromContext(c)
	if !ok || subject.UserID <= 0 {
		response.Unauthorized(c, "User not authenticated")
		return 0, false
	}
	return subject.UserID, true
}

func resellerPagination(c *gin.Context) pagination.PaginationParams {
	page, pageSize := response.ParsePagination(c)
	return pagination.PaginationParams{Page: page, PageSize: pageSize}
}

func resellerPathID(c *gin.Context) (int64, bool) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		response.BadRequest(c, "Invalid id")
		return 0, false
	}
	return id, true
}

func (h *ResellerHandler) Profile(c *gin.Context) {
	actorID, ok := resellerActor(c)
	if !ok {
		return
	}
	user, affiliate, err := h.service.GetProfile(c.Request.Context(), actorID)
	if response.ErrorFrom(c, err) {
		return
	}
	response.Success(c, gin.H{"id": user.ID, "email": user.Email, "username": user.Username, "balance": user.Balance, "affiliate_code": affiliate.AffCode})
}

func (h *ResellerHandler) ListUsers(c *gin.Context) {
	actorID, ok := resellerActor(c)
	if !ok {
		return
	}
	items, result, err := h.service.ListUsers(c.Request.Context(), actorID, resellerPagination(c))
	if response.ErrorFrom(c, err) {
		return
	}
	response.Paginated(c, items, result.Total, result.Page, result.PageSize)
}

func (h *ResellerHandler) GetUser(c *gin.Context) {
	actorID, ok := resellerActor(c)
	if !ok {
		return
	}
	userID, ok := resellerPathID(c)
	if !ok {
		return
	}
	item, err := h.service.GetUser(c.Request.Context(), actorID, userID)
	if response.ErrorFrom(c, err) {
		return
	}
	response.Success(c, item)
}

func (h *ResellerHandler) UserUsage(c *gin.Context) {
	actorID, ok := resellerActor(c)
	if !ok {
		return
	}
	userID, ok := resellerPathID(c)
	if !ok {
		return
	}
	items, result, err := h.service.ListUserUsage(c.Request.Context(), actorID, userID, resellerPagination(c))
	if response.ErrorFrom(c, err) {
		return
	}
	response.Paginated(c, items, result.Total, result.Page, result.PageSize)
}

func (h *ResellerHandler) TransferBalance(c *gin.Context) {
	actorID, ok := resellerActor(c)
	if !ok {
		return
	}
	userID, ok := resellerPathID(c)
	if !ok {
		return
	}
	var req struct {
		Amount float64 `json:"amount" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request")
		return
	}
	result, err := h.service.TransferBalance(c.Request.Context(), actorID, userID, req.Amount, c.GetHeader("Idempotency-Key"))
	if response.ErrorFrom(c, err) {
		return
	}
	response.Success(c, result)
}

func (h *ResellerHandler) CreateCDKeys(c *gin.Context) {
	actorID, ok := resellerActor(c)
	if !ok {
		return
	}
	var req struct {
		Count         int     `json:"count" binding:"required"`
		Value         float64 `json:"value" binding:"required"`
		ExpiresInDays *int    `json:"expires_in_days" binding:"omitempty,min=1,max=3650"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request")
		return
	}
	result, err := h.service.CreateCDKeyBatch(c.Request.Context(), actorID, req.Count, req.Value, req.ExpiresInDays, c.GetHeader("Idempotency-Key"))
	if response.ErrorFrom(c, err) {
		return
	}
	response.Created(c, gin.H{"ledger_id": result.LedgerID, "codes": resellerCDKeys(result.Codes), "total_value": result.TotalValue, "reseller_balance_after": result.ResellerBalanceAfter, "replayed": result.Replayed})
}

func (h *ResellerHandler) AdminCreateCDKeys(c *gin.Context) {
	var req struct {
		ResellerID    int64   `json:"reseller_id" binding:"required,gt=0"`
		Count         int     `json:"count" binding:"required"`
		Value         float64 `json:"value" binding:"required"`
		ExpiresInDays *int    `json:"expires_in_days" binding:"omitempty,min=1,max=3650"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request")
		return
	}
	result, err := h.service.CreateCDKeyBatch(c.Request.Context(), req.ResellerID, req.Count, req.Value, req.ExpiresInDays, c.GetHeader("Idempotency-Key"))
	if response.ErrorFrom(c, err) {
		return
	}
	response.Created(c, gin.H{"ledger_id": result.LedgerID, "codes": resellerCDKeys(result.Codes), "total_value": result.TotalValue, "reseller_balance_after": result.ResellerBalanceAfter, "replayed": result.Replayed})
}

func (h *ResellerHandler) ListCDKeys(c *gin.Context) {
	actorID, ok := resellerActor(c)
	if !ok {
		return
	}
	items, result, err := h.service.ListCDKeys(c.Request.Context(), actorID, resellerPagination(c), c.Query("status"), c.Query("search"))
	if response.ErrorFrom(c, err) {
		return
	}
	response.Paginated(c, resellerCDKeys(items), result.Total, result.Page, result.PageSize)
}

func (h *ResellerHandler) GetCDKey(c *gin.Context) {
	actorID, ok := resellerActor(c)
	if !ok {
		return
	}
	codeID, ok := resellerPathID(c)
	if !ok {
		return
	}
	item, err := h.service.GetCDKey(c.Request.Context(), actorID, codeID)
	if response.ErrorFrom(c, err) {
		return
	}
	response.Success(c, resellerCDKeys([]service.RedeemCode{*item})[0])
}

func (h *ResellerHandler) ExportCDKeys(c *gin.Context) {
	actorID, ok := resellerActor(c)
	if !ok {
		return
	}
	items, _, err := h.service.ListCDKeys(c.Request.Context(), actorID, pagination.PaginationParams{Page: 1, PageSize: 1000}, c.Query("status"), c.Query("search"))
	if response.ErrorFrom(c, err) {
		return
	}
	c.Header("Content-Disposition", `attachment; filename="cdkeys.csv"`)
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Status(http.StatusOK)
	w := csv.NewWriter(c.Writer)
	_ = w.Write([]string{"code", "value", "status", "used_by", "used_at", "created_at"})
	for i := range items {
		usedBy, usedAt := "", ""
		if items[i].UsedBy != nil {
			usedBy = strconv.FormatInt(*items[i].UsedBy, 10)
		}
		if items[i].UsedAt != nil {
			usedAt = items[i].UsedAt.UTC().Format(time.RFC3339)
		}
		_ = w.Write([]string{items[i].Code, strconv.FormatFloat(items[i].Value, 'f', -1, 64), items[i].Status, usedBy, usedAt, items[i].CreatedAt.UTC().Format(time.RFC3339)})
	}
	w.Flush()
}
