package provider

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/payment"
	"github.com/shopspring/decimal"
)

const (
	rpayUSDTDefaultAPIBase = "https://api.rpay.vn/api"
	rpayUSDTHTTPTimeout    = 15 * time.Second
	rpayUSDTMaxResponse    = 1 << 20
)

type RpayUSDT struct {
	instanceID string
	config     map[string]string
	httpClient *http.Client
}

type rpayUSDTInvoice struct {
	TransID       string `json:"trans_id"`
	RequestID     string `json:"request_id"`
	Amount        string `json:"amount"`
	Received      string `json:"received"`
	Status        string `json:"status"`
	URLPayment    string `json:"url_payment"`
	Address       string `json:"address"`
	Network       string `json:"network"`
	NetworkName   string `json:"network_name"`
	Token         string `json:"token"`
	TokenAddress  string `json:"token_address"`
	ExpiresAt     string `json:"expires_at"`
	QRContent     string `json:"qr_content"`
	QRCode        string `json:"qrcode"`
	FromAddress   string `json:"from_address"`
	TransactionID string `json:"transaction_id"`
}

type rpayUSDTResponse struct {
	Data   rpayUSDTInvoice `json:"data"`
	Status string          `json:"status"`
	Msg    string          `json:"msg"`
}

func NewRpayUSDT(instanceID string, config map[string]string) (*RpayUSDT, error) {
	for _, key := range []string{"merchantId", "apiKey", "network", "callbackUrl"} {
		if strings.TrimSpace(config[key]) == "" {
			return nil, fmt.Errorf("rpay usdt config missing required key: %s", key)
		}
	}
	cfg := cloneStringMap(config)
	cfg["token"] = strings.ToUpper(strings.TrimSpace(cfg["token"]))
	if cfg["token"] == "" {
		cfg["token"] = "USDT"
	}
	if cfg["token"] != "USDT" {
		return nil, fmt.Errorf("rpay usdt token must be USDT")
	}
	base := strings.TrimSpace(cfg["apiBase"])
	if base == "" {
		base = rpayUSDTDefaultAPIBase
	}
	parsed, err := url.Parse(base)
	if err != nil || parsed.Scheme != "https" || parsed.Host == "" {
		return nil, fmt.Errorf("rpay usdt apiBase must be an HTTPS URL")
	}
	parsed.RawQuery = ""
	parsed.Fragment = ""
	parsed.Path = strings.TrimRight(parsed.Path, "/")
	cfg["apiBase"] = strings.TrimRight(parsed.String(), "/")
	if _, err := url.ParseRequestURI(cfg["callbackUrl"]); err != nil {
		return nil, fmt.Errorf("rpay usdt callbackUrl is invalid")
	}
	expireMinutes := 30
	if raw := strings.TrimSpace(cfg["expireMinutes"]); raw != "" {
		expireMinutes, err = strconv.Atoi(raw)
		if err != nil || expireMinutes < 1 || expireMinutes > 1440 {
			return nil, fmt.Errorf("rpay usdt expireMinutes must be between 1 and 1440")
		}
	}
	cfg["expireMinutes"] = strconv.Itoa(expireMinutes)
	return &RpayUSDT{instanceID: instanceID, config: cfg, httpClient: &http.Client{Timeout: rpayUSDTHTTPTimeout}}, nil
}

func (r *RpayUSDT) Name() string        { return "Rpay USDT" }
func (r *RpayUSDT) ProviderKey() string { return payment.TypeRpayUSDT }
func (r *RpayUSDT) SupportedTypes() []payment.PaymentType {
	return []payment.PaymentType{payment.TypeRpayUSDT}
}

func (r *RpayUSDT) MerchantIdentityMetadata() map[string]string {
	return map[string]string{
		"merchant_id": strings.TrimSpace(r.config["merchantId"]),
		"network":     strings.ToLower(strings.TrimSpace(r.config["network"])),
		"token":       "USDT",
		"currency":    "USD",
	}
}

func (r *RpayUSDT) CreatePayment(ctx context.Context, req payment.CreatePaymentRequest) (*payment.CreatePaymentResponse, error) {
	amount, err := decimal.NewFromString(strings.TrimSpace(req.Amount))
	if err != nil || amount.LessThanOrEqual(decimal.Zero) || amount.Exponent() < -2 {
		return nil, fmt.Errorf("rpay usdt amount must be positive with at most 2 decimals")
	}
	values := url.Values{
		"merchant_id":   {r.config["merchantId"]},
		"api_key":       {r.config["apiKey"]},
		"name":          {req.Subject},
		"description":   {req.OrderID},
		"amount":        {amount.StringFixed(2)},
		"token":         {"USDT"},
		"network":       {strings.ToLower(strings.TrimSpace(r.config["network"]))},
		"expireMinutes": {r.config["expireMinutes"]},
		"request_id":    {req.OrderID},
		"callback_url":  {r.config["callbackUrl"]},
	}
	if req.ReturnURL != "" {
		values.Set("success_url", req.ReturnURL)
		values.Set("cancel_url", req.ReturnURL)
	}
	response, err := r.postForm(ctx, "/AddInvoice", values)
	if err != nil {
		return nil, fmt.Errorf("rpay usdt create invoice: %w", err)
	}
	if response.Data.TransID == "" || response.Data.URLPayment == "" {
		return nil, fmt.Errorf("rpay usdt create invoice: missing transaction details")
	}
	return &payment.CreatePaymentResponse{
		TradeNo:  response.Data.TransID,
		PayURL:   response.Data.URLPayment,
		QRCode:   response.Data.QRContent,
		Currency: "USD",
	}, nil
}

func (r *RpayUSDT) QueryOrder(ctx context.Context, transID string) (*payment.QueryOrderResponse, error) {
	transID = strings.TrimSpace(transID)
	if transID == "" {
		return nil, fmt.Errorf("rpay usdt trans_id is required")
	}
	response, err := r.postForm(ctx, "/GetInvoiceStatus", url.Values{
		"merchant_id": {r.config["merchantId"]},
		"api_key":     {r.config["apiKey"]},
		"trans_id":    {transID},
	})
	if err != nil {
		return nil, fmt.Errorf("rpay usdt query invoice: %w", err)
	}
	invoice := response.Data
	status := payment.ProviderStatusPending
	amount := 0.0
	metadata := r.MerchantIdentityMetadata()
	metadata["request_id"] = strings.TrimSpace(invoice.RequestID)
	metadata["transaction_id"] = strings.TrimSpace(invoice.TransactionID)
	metadata["from_address"] = strings.TrimSpace(invoice.FromAddress)
	metadata["received"] = strings.TrimSpace(invoice.Received)
	if strings.EqualFold(invoice.Status, "completed") {
		expected, expectedErr := decimal.NewFromString(invoice.Amount)
		received, receivedErr := decimal.NewFromString(invoice.Received)
		if expectedErr != nil || receivedErr != nil || received.LessThan(expected) || strings.TrimSpace(invoice.TransactionID) == "" {
			return nil, fmt.Errorf("rpay usdt completed invoice has invalid settlement")
		}
		amount = expected.InexactFloat64()
		status = payment.ProviderStatusPaid
	} else if strings.EqualFold(invoice.Status, "expired") {
		status = payment.ProviderStatusFailed
	}
	return &payment.QueryOrderResponse{TradeNo: transID, Status: status, Amount: amount, Metadata: metadata}, nil
}

func (r *RpayUSDT) VerifyNotification(ctx context.Context, rawBody string, _ map[string]string) (*payment.PaymentNotification, error) {
	values, err := url.ParseQuery(rawBody)
	if err != nil {
		return nil, fmt.Errorf("rpay usdt callback parse: %w", err)
	}
	if values.Get("merchant_id") != r.config["merchantId"] || values.Get("api_key") != r.config["apiKey"] {
		return nil, fmt.Errorf("rpay usdt callback credentials mismatch")
	}
	requestID := strings.TrimSpace(values.Get("request_id"))
	transID := strings.TrimSpace(values.Get("trans_id"))
	if requestID == "" || transID == "" {
		return nil, fmt.Errorf("rpay usdt callback missing identifiers")
	}
	if !strings.EqualFold(values.Get("status"), "completed") {
		return nil, nil
	}
	verified, err := r.QueryOrder(ctx, transID)
	if err != nil {
		return nil, err
	}
	if verified.Status != payment.ProviderStatusPaid || verified.Metadata["request_id"] != requestID {
		return nil, fmt.Errorf("rpay usdt callback status verification failed")
	}
	return &payment.PaymentNotification{
		TradeNo:  transID,
		OrderID:  requestID,
		Amount:   verified.Amount,
		Status:   payment.NotificationStatusSuccess,
		Metadata: verified.Metadata,
	}, nil
}

func (r *RpayUSDT) Refund(context.Context, payment.RefundRequest) (*payment.RefundResponse, error) {
	return nil, fmt.Errorf("rpay usdt refund is not supported")
}

func (r *RpayUSDT) postForm(ctx context.Context, path string, values url.Values) (*rpayUSDTResponse, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, r.config["apiBase"]+path, strings.NewReader(values.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, rpayUSDTMaxResponse+1))
	if err != nil {
		return nil, err
	}
	if len(body) > rpayUSDTMaxResponse {
		return nil, fmt.Errorf("response too large")
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("upstream returned HTTP %d", resp.StatusCode)
	}
	var result rpayUSDTResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	if !strings.EqualFold(result.Status, "success") {
		return nil, fmt.Errorf("upstream status %q: %s", result.Status, result.Msg)
	}
	return &result, nil
}
