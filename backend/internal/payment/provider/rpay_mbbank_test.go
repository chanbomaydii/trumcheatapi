package provider

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Wei-Shaw/sub2api/internal/payment"
	"github.com/stretchr/testify/require"
)

func TestRpayMBBankQueryOrderMatchesIncomingTransfer(t *testing.T) {
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		require.Equal(t, "/historyapimbbankv3/bank-pass/123456/token-value", req.URL.Path)
		_, _ = w.Write([]byte(`{"status":"success","msg":"Thành công","transactions":[{"transactionID":"OUT-1","amount":26000,"description":"PAY-123-456","transactionDate":"2026-08-18","type":"OUT"},{"transactionID":"IN-WRONG","amount":26000,"description":"PAY-123-4567","transactionDate":"2026-08-18","type":"IN"},{"transactionID":"IN-1","amount":26000,"description":"NAP TIEN PAY-123-456 TU MBBANK","transactionDate":"2026-08-18","type":"IN"}]}`))
	}))
	defer server.Close()

	provider, err := NewRpayMBBank("1", map[string]string{
		"password": "bank-pass", "accountNumber": "123456", "token": "token-value", "vndPerUsdt": "26000", "apiBase": server.URL,
	})
	require.NoError(t, err)
	provider.httpClient = server.Client()

	result, err := provider.QueryOrder(context.Background(), "PAY-123-456")
	require.NoError(t, err)
	require.Equal(t, payment.ProviderStatusPaid, result.Status)
	require.Equal(t, "IN-1", result.TradeNo)
	require.Equal(t, float64(26000), result.Amount)
	require.Equal(t, "VND", result.Metadata["currency"])
}

func TestRpayMBBankCreatePaymentBuildsVietQRURL(t *testing.T) {
	provider, err := NewRpayMBBank("1", map[string]string{
		"password": "bank-pass", "accountNumber": "123456", "accountName": "TRUM CHEAT", "token": "token-value", "vndPerUsdt": "26000",
	})
	require.NoError(t, err)

	result, err := provider.CreatePayment(context.Background(), payment.CreatePaymentRequest{OrderID: "PAY-123-456", Amount: "26000"})
	require.NoError(t, err)
	require.Equal(t, "VND", result.Currency)
	require.True(t, strings.HasPrefix(result.QRCode, "https://img.vietqr.io/image/MB-123456-compact2.png?"))
	require.Contains(t, result.QRCode, "amount=26000")
	require.Contains(t, result.QRCode, "addInfo=PAY-123-456")
}

func TestRpayMBBankRequiresWholeVND(t *testing.T) {
	provider, err := NewRpayMBBank("1", map[string]string{
		"password": "bank-pass", "accountNumber": "123456", "token": "token-value", "vndPerUsdt": "26000",
	})
	require.NoError(t, err)

	_, err = provider.CreatePayment(context.Background(), payment.CreatePaymentRequest{OrderID: "PAY-1", Amount: "26000.50"})
	require.ErrorContains(t, err, "invalid VND amount")
}
