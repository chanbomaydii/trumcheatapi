package provider

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/Wei-Shaw/sub2api/internal/payment"
	"github.com/stretchr/testify/require"
)

func TestRpayUSDTCreatePaymentAndVerifyCallback(t *testing.T) {
	statusCalls := 0
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		require.NoError(t, req.ParseForm())
		require.Equal(t, "merchant-1", req.Form.Get("merchant_id"))
		require.Equal(t, "secret-key", req.Form.Get("api_key"))
		switch req.URL.Path {
		case "/AddInvoice":
			require.Equal(t, "PAY-123", req.Form.Get("request_id"))
			require.Equal(t, "12.00", req.Form.Get("amount"))
			require.Equal(t, "tron", req.Form.Get("network"))
			_, _ = w.Write([]byte(`{"status":"success","data":{"trans_id":"TX-1","amount":"12.00","status":"waiting","url_payment":"https://pay.example/TX-1","network":"tron","token":"USDT","qr_content":"TAddress"}}`))
		case "/GetInvoiceStatus":
			statusCalls++
			require.Equal(t, "TX-1", req.Form.Get("trans_id"))
			_, _ = w.Write([]byte(`{"status":"success","data":{"trans_id":"TX-1","request_id":"PAY-123","amount":"12.00","received":"12.00","status":"completed","network":"tron","token":"USDT","from_address":"TFrom","transaction_id":"chain-tx-1"}}`))
		default:
			http.NotFound(w, req)
		}
	}))
	defer server.Close()

	provider, err := NewRpayUSDT("1", map[string]string{
		"merchantId": "merchant-1", "apiKey": "secret-key", "network": "tron",
		"callbackUrl": "https://merchant.example/api/v1/payment/webhook/rpay_usdt", "apiBase": server.URL,
	})
	require.NoError(t, err)
	provider.httpClient = server.Client()

	created, err := provider.CreatePayment(context.Background(), payment.CreatePaymentRequest{OrderID: "PAY-123", Amount: "12", Subject: "Recharge"})
	require.NoError(t, err)
	require.Equal(t, "TX-1", created.TradeNo)
	require.Equal(t, "https://pay.example/TX-1", created.PayURL)
	require.Equal(t, "USD", created.Currency)

	callback := url.Values{
		"merchant_id": {"merchant-1"}, "api_key": {"secret-key"}, "request_id": {"PAY-123"},
		"trans_id": {"TX-1"}, "status": {"completed"}, "amount": {"12.00"}, "received": {"12.00"},
	}.Encode()
	notification, err := provider.VerifyNotification(context.Background(), callback, nil)
	require.NoError(t, err)
	require.Equal(t, 1, statusCalls)
	require.Equal(t, "PAY-123", notification.OrderID)
	require.Equal(t, "chain-tx-1", notification.Metadata["transaction_id"])
	require.Equal(t, float64(12), notification.Amount)
}

func TestRpayUSDTQueryRejectsInvalidCompletedSettlement(t *testing.T) {
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`{"status":"success","data":{"trans_id":"TX-2","request_id":"PAY-2","amount":"10.00","received":"9.99","status":"completed","network":"tron","token":"USDT","transaction_id":"chain-tx-2"}}`))
	}))
	defer server.Close()
	provider, err := NewRpayUSDT("1", map[string]string{
		"merchantId": "merchant-1", "apiKey": "secret-key", "network": "tron",
		"callbackUrl": "https://merchant.example/callback", "apiBase": server.URL,
	})
	require.NoError(t, err)
	provider.httpClient = server.Client()

	_, err = provider.QueryOrder(context.Background(), "TX-2")
	require.ErrorContains(t, err, "invalid settlement")
}
