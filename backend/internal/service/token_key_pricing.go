package service

import (
	infraerrors "github.com/Wei-Shaw/sub2api/internal/pkg/errors"
	"github.com/shopspring/decimal"
)

var ErrInvalidTokenKeyPurchase = infraerrors.BadRequest("INVALID_TOKEN_KEY_PURCHASE", "token amount must be at least 1 million, and duration and unit price must be greater than zero")

const tokensPerMillion = int64(1_000_000)

// CalculateTokenKeyPrice returns the prepaid key price in USD.
func CalculateTokenKeyPrice(tokenAmount int64, durationDays int, pricePerMillionPerDay float64) (float64, error) {
	if tokenAmount < tokensPerMillion || durationDays <= 0 || pricePerMillionPerDay <= 0 {
		return 0, ErrInvalidTokenKeyPurchase
	}

	price := decimal.NewFromInt(tokenAmount).
		Div(decimal.NewFromInt(tokensPerMillion)).
		Mul(decimal.NewFromInt(int64(durationDays))).
		Mul(decimal.NewFromFloat(pricePerMillionPerDay)).
		Round(UsageBillingMonetaryScale)
	result, _ := price.Float64()
	if result <= 0 {
		return 0, ErrInvalidTokenKeyPurchase
	}
	return result, nil
}
