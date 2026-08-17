//go:build integration

package repository

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"

	"github.com/Wei-Shaw/sub2api/internal/service"
)

func TestPurchaseTokenKeyDeductsBalanceAndCreatesSnapshotAtomically(t *testing.T) {
	ctx := context.Background()
	client := testEntClient(t)
	repo := NewAPIKeyRepository(client, integrationDB).(*apiKeyRepository)
	user := mustCreateUser(t, client, &service.User{
		Email:        fmt.Sprintf("token-purchase-%d@example.com", time.Now().UnixNano()),
		PasswordHash: "hash",
		Balance:      20,
	})
	purchasedAt := time.Now().UTC().Truncate(time.Microsecond)
	expiresAt := purchasedAt.AddDate(0, 0, 7)
	key := &service.APIKey{
		UserID:             user.ID,
		Key:                "sk-token-purchase-" + uuid.NewString(),
		Name:               "prepaid",
		Status:             service.StatusAPIKeyActive,
		TokenQuota:         30_000_000,
		TokenUnitPrice:     0.05,
		TokenDurationDays:  7,
		TokenPurchasePrice: 10.5,
		TokenPurchasedAt:   &purchasedAt,
		ExpiresAt:          &expiresAt,
	}

	require.NoError(t, repo.PurchaseTokenKey(ctx, key, key.TokenPurchasePrice))
	require.NotZero(t, key.ID)

	var balance float64
	require.NoError(t, integrationDB.QueryRowContext(ctx, "SELECT balance FROM users WHERE id = $1", user.ID).Scan(&balance))
	require.Equal(t, 9.5, balance)

	var quota int64
	var unitPrice, purchasePrice float64
	var duration int
	require.NoError(t, integrationDB.QueryRowContext(ctx, `
		SELECT token_quota, token_unit_price, token_duration_days, token_purchase_price
		FROM api_keys WHERE id = $1
	`, key.ID).Scan(&quota, &unitPrice, &duration, &purchasePrice))
	require.Equal(t, int64(30_000_000), quota)
	require.Equal(t, 0.05, unitPrice)
	require.Equal(t, 7, duration)
	require.Equal(t, 10.5, purchasePrice)
}

func TestPurchaseTokenKeyInsufficientBalanceDoesNotCreateKey(t *testing.T) {
	ctx := context.Background()
	client := testEntClient(t)
	repo := NewAPIKeyRepository(client, integrationDB).(*apiKeyRepository)
	user := mustCreateUser(t, client, &service.User{
		Email:        fmt.Sprintf("token-purchase-low-%d@example.com", time.Now().UnixNano()),
		PasswordHash: "hash",
		Balance:      1,
	})
	key := &service.APIKey{
		UserID: user.ID,
		Key:    "sk-token-purchase-low-" + uuid.NewString(),
		Name:   "prepaid",
		Status: service.StatusAPIKeyActive,
	}

	err := repo.PurchaseTokenKey(ctx, key, 2)
	require.ErrorIs(t, err, service.ErrInsufficientBalance)

	var balance float64
	require.NoError(t, integrationDB.QueryRowContext(ctx, "SELECT balance FROM users WHERE id = $1", user.ID).Scan(&balance))
	require.Equal(t, 1.0, balance)
	var count int
	require.NoError(t, integrationDB.QueryRowContext(ctx, "SELECT COUNT(*) FROM api_keys WHERE key = $1", key.Key).Scan(&count))
	require.Zero(t, count)
}
