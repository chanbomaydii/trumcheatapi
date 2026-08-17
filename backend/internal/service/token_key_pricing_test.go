package service

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestCalculateTokenKeyPrice(t *testing.T) {
	price, err := CalculateTokenKeyPrice(30_000_000, 7, 0.05)
	require.NoError(t, err)
	require.Equal(t, 10.5, price)
}

func TestCalculateTokenKeyPriceRequiresOneMillionTokens(t *testing.T) {
	_, err := CalculateTokenKeyPrice(999_999, 1, 0.05)
	require.ErrorIs(t, err, ErrInvalidTokenKeyPurchase)
}

func TestCalculateTokenKeyPriceRejectsNonPositiveInputs(t *testing.T) {
	for _, input := range []struct {
		tokens int64
		days   int
		price  float64
	}{
		{tokens: 0, days: 1, price: 0.05},
		{tokens: 1_000_000, days: 0, price: 0.05},
		{tokens: 1_000_000, days: 1, price: 0},
	} {
		_, err := CalculateTokenKeyPrice(input.tokens, input.days, input.price)
		require.True(t, errors.Is(err, ErrInvalidTokenKeyPurchase))
	}
}
