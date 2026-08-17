package service

import (
	"context"
	"testing"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/pagination"
	"github.com/stretchr/testify/require"
)

type resellerRepoStub struct {
	transferActor int64
	transferUser  int64
	transferKey   string
	createdCodes  []RedeemCode
}

func (r *resellerRepoStub) GetProfile(context.Context, int64) (*User, *AffiliateSummary, error) {
	return nil, nil, nil
}
func (r *resellerRepoStub) ListUsers(context.Context, int64, pagination.PaginationParams) ([]ResellerUser, *pagination.PaginationResult, error) {
	return nil, nil, nil
}
func (r *resellerRepoStub) GetUser(context.Context, int64, int64) (*ResellerUser, error) {
	return &ResellerUser{}, nil
}
func (r *resellerRepoStub) TransferBalance(_ context.Context, actorID, userID int64, amount float64, key string) (*ResellerTransferResult, error) {
	r.transferActor, r.transferUser, r.transferKey = actorID, userID, key
	return &ResellerTransferResult{Amount: amount}, nil
}
func (r *resellerRepoStub) CreateCDKeyBatch(_ context.Context, _ int64, _ float64, codes []RedeemCode, _ string) (*ResellerCDKeyBatchResult, error) {
	r.createdCodes = codes
	return &ResellerCDKeyBatchResult{Codes: codes}, nil
}
func (r *resellerRepoStub) ListCDKeys(context.Context, int64, pagination.PaginationParams, string, string) ([]RedeemCode, *pagination.PaginationResult, error) {
	return nil, nil, nil
}
func (r *resellerRepoStub) GetCDKey(context.Context, int64, int64) (*RedeemCode, error) {
	return nil, nil
}

func TestResellerServiceTransferUsesActorAndRequiresIdempotency(t *testing.T) {
	repo := &resellerRepoStub{}
	svc := NewResellerService(repo, nil, nil, nil)

	_, err := svc.TransferBalance(context.Background(), 41, 72, 10, "")
	require.ErrorIs(t, err, ErrIdempotencyRequired)

	result, err := svc.TransferBalance(context.Background(), 41, 72, 10, " transfer-1 ")
	require.NoError(t, err)
	require.Equal(t, float64(10), result.Amount)
	require.Equal(t, int64(41), repo.transferActor)
	require.Equal(t, int64(72), repo.transferUser)
	require.Equal(t, "transfer-1", repo.transferKey)
}

func TestResellerServiceRejectsInvalidCDKeyBatch(t *testing.T) {
	svc := NewResellerService(&resellerRepoStub{}, nil, nil, nil)
	_, err := svc.CreateCDKeyBatch(context.Background(), 41, 0, 10, nil, "batch-1")
	require.Error(t, err)
	_, err = svc.CreateCDKeyBatch(context.Background(), 41, 2, -1, nil, "batch-1")
	require.Error(t, err)
}

func TestResellerServiceAppliesCDKeyExpiryToEntireBatch(t *testing.T) {
	repo := &resellerRepoStub{}
	svc := NewResellerService(repo, nil, nil, nil)
	days := 7
	before := time.Now().UTC().AddDate(0, 0, days)

	_, err := svc.CreateCDKeyBatch(context.Background(), 41, 2, 10, &days, "batch-expiry")
	require.NoError(t, err)
	require.Len(t, repo.createdCodes, 2)
	require.NotNil(t, repo.createdCodes[0].ExpiresAt)
	require.WithinDuration(t, before, *repo.createdCodes[0].ExpiresAt, time.Second)
	require.Equal(t, repo.createdCodes[0].ExpiresAt, repo.createdCodes[1].ExpiresAt)
}
