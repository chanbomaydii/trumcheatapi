package service

import (
	"context"
	"math"
	"strings"
	"time"

	infraerrors "github.com/Wei-Shaw/sub2api/internal/pkg/errors"
	"github.com/Wei-Shaw/sub2api/internal/pkg/logger"
	"github.com/Wei-Shaw/sub2api/internal/pkg/pagination"
)

const RedeemSourceResellerCDKey = "reseller_cdkey"

var (
	ErrResellerUserNotOwned = infraerrors.NotFound("RESELLER_USER_NOT_FOUND", "user not found")
	ErrResellerRequired     = infraerrors.Forbidden("RESELLER_REQUIRED", "reseller access required")
	ErrIdempotencyRequired  = infraerrors.BadRequest("IDEMPOTENCY_KEY_REQUIRED", "Idempotency-Key header is required")
)

type ResellerUser struct {
	ID             int64     `json:"id"`
	Email          string    `json:"email"`
	Username       string    `json:"username"`
	Status         string    `json:"status"`
	Balance        float64   `json:"balance"`
	TotalRecharged float64   `json:"total_recharged"`
	InvitedAt      time.Time `json:"invited_at"`
}

type ResellerTransferResult struct {
	LedgerID             int64   `json:"ledger_id"`
	Amount               float64 `json:"amount"`
	ResellerBalanceAfter float64 `json:"reseller_balance_after"`
	TargetBalanceAfter   float64 `json:"target_balance_after"`
	Replayed             bool    `json:"replayed"`
}

type ResellerCDKeyBatchResult struct {
	LedgerID             int64        `json:"ledger_id"`
	Codes                []RedeemCode `json:"codes"`
	TotalValue           float64      `json:"total_value"`
	ResellerBalanceAfter float64      `json:"reseller_balance_after"`
	Replayed             bool         `json:"replayed"`
}

type ResellerRepository interface {
	GetProfile(ctx context.Context, resellerID int64) (*User, *AffiliateSummary, error)
	ListUsers(ctx context.Context, resellerID int64, params pagination.PaginationParams) ([]ResellerUser, *pagination.PaginationResult, error)
	GetUser(ctx context.Context, resellerID, userID int64) (*ResellerUser, error)
	TransferBalance(ctx context.Context, resellerID, userID int64, amount float64, idempotencyKey string) (*ResellerTransferResult, error)
	CreateCDKeyBatch(ctx context.Context, resellerID int64, value float64, codes []RedeemCode, idempotencyKey string) (*ResellerCDKeyBatchResult, error)
	ListCDKeys(ctx context.Context, resellerID int64, params pagination.PaginationParams, status, search string) ([]RedeemCode, *pagination.PaginationResult, error)
	GetCDKey(ctx context.Context, resellerID, codeID int64) (*RedeemCode, error)
}

type ResellerService struct {
	repo                 ResellerRepository
	usageService         *UsageService
	billingCacheService  *BillingCacheService
	authCacheInvalidator APIKeyAuthCacheInvalidator
}

func NewResellerService(repo ResellerRepository, usageService *UsageService, billingCacheService *BillingCacheService, authCacheInvalidator APIKeyAuthCacheInvalidator) *ResellerService {
	return &ResellerService{repo: repo, usageService: usageService, billingCacheService: billingCacheService, authCacheInvalidator: authCacheInvalidator}
}

func (s *ResellerService) GetProfile(ctx context.Context, actorID int64) (*User, *AffiliateSummary, error) {
	return s.repo.GetProfile(ctx, actorID)
}

func (s *ResellerService) ListUsers(ctx context.Context, actorID int64, params pagination.PaginationParams) ([]ResellerUser, *pagination.PaginationResult, error) {
	return s.repo.ListUsers(ctx, actorID, params)
}

func (s *ResellerService) GetUser(ctx context.Context, actorID, userID int64) (*ResellerUser, error) {
	return s.repo.GetUser(ctx, actorID, userID)
}

func (s *ResellerService) ListUserUsage(ctx context.Context, actorID, userID int64, params pagination.PaginationParams) ([]UsageLog, *pagination.PaginationResult, error) {
	if _, err := s.repo.GetUser(ctx, actorID, userID); err != nil {
		return nil, nil, err
	}
	return s.usageService.ListByUser(ctx, userID, params)
}

func (s *ResellerService) TransferBalance(ctx context.Context, actorID, userID int64, amount float64, idempotencyKey string) (*ResellerTransferResult, error) {
	idempotencyKey = strings.TrimSpace(idempotencyKey)
	if idempotencyKey == "" {
		return nil, ErrIdempotencyRequired
	}
	if amount <= 0 || math.IsNaN(amount) || math.IsInf(amount, 0) {
		return nil, infraerrors.BadRequest("TRANSFER_AMOUNT_INVALID", "amount must be greater than zero")
	}
	result, err := s.repo.TransferBalance(ctx, actorID, userID, amount, idempotencyKey)
	if err != nil {
		return nil, err
	}
	s.invalidateBalances(ctx, actorID, userID)
	return result, nil
}

func (s *ResellerService) CreateCDKeyBatch(ctx context.Context, actorID int64, count int, value float64, expiresInDays *int, idempotencyKey string) (*ResellerCDKeyBatchResult, error) {
	idempotencyKey = strings.TrimSpace(idempotencyKey)
	if idempotencyKey == "" {
		return nil, ErrIdempotencyRequired
	}
	if count <= 0 || count > 1000 || value <= 0 || math.IsNaN(value) || math.IsInf(value, 0) {
		return nil, infraerrors.BadRequest("CDKEY_BATCH_INVALID", "count must be 1..1000 and value must be greater than zero")
	}
	var expiresAt *time.Time
	if expiresInDays != nil {
		if *expiresInDays <= 0 || *expiresInDays > 3650 {
			return nil, infraerrors.BadRequest("CDKEY_EXPIRY_INVALID", "expires_in_days must be 1..3650")
		}
		expires := time.Now().UTC().AddDate(0, 0, *expiresInDays)
		expiresAt = &expires
	}
	codes := make([]RedeemCode, 0, count)
	for range count {
		code, err := GenerateRedeemCode()
		if err != nil {
			return nil, err
		}
		codes = append(codes, RedeemCode{Code: strings.ToUpper(code), Type: RedeemTypeBalance, Source: RedeemSourceResellerCDKey, Value: value, Status: StatusUnused, CreatedByResellerID: &actorID, ValidityDays: 0, ExpiresAt: expiresAt})
	}
	result, err := s.repo.CreateCDKeyBatch(ctx, actorID, value, codes, idempotencyKey)
	if err != nil {
		return nil, err
	}
	s.invalidateBalances(ctx, actorID)
	return result, nil
}

func (s *ResellerService) ListCDKeys(ctx context.Context, actorID int64, params pagination.PaginationParams, status, search string) ([]RedeemCode, *pagination.PaginationResult, error) {
	return s.repo.ListCDKeys(ctx, actorID, params, status, search)
}

func (s *ResellerService) GetCDKey(ctx context.Context, actorID, codeID int64) (*RedeemCode, error) {
	return s.repo.GetCDKey(ctx, actorID, codeID)
}

func (s *ResellerService) invalidateBalances(ctx context.Context, userIDs ...int64) {
	for _, userID := range userIDs {
		if s.authCacheInvalidator != nil {
			s.authCacheInvalidator.InvalidateAuthCacheByUserID(ctx, userID)
		}
		if s.billingCacheService != nil {
			if err := s.billingCacheService.InvalidateUserBalance(ctx, userID); err != nil {
				logger.LegacyPrintf("service.reseller", "failed to invalidate balance for user %d: %v", userID, err)
			}
		}
	}
}
