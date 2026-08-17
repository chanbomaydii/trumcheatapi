package provider

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/payment"
)

const (
	rpayMBBankDefaultAPIBase = "https://api.rpay.vn"
	rpayMBBankHTTPTimeout    = 15 * time.Second
	rpayMBBankMaxResponse    = 1 << 20
)

type RpayMBBank struct {
	instanceID string
	config     map[string]string
	httpClient *http.Client
}

type rpayMBBankHistoryResponse struct {
	Status       string                  `json:"status"`
	Message      string                  `json:"msg"`
	Transactions []rpayMBBankTransaction `json:"transactions"`
}

type rpayMBBankTransaction struct {
	TransactionID   string  `json:"transactionID"`
	Amount          float64 `json:"amount"`
	Description     string  `json:"description"`
	TransactionDate string  `json:"transactionDate"`
	Type            string  `json:"type"`
}

func NewRpayMBBank(instanceID string, config map[string]string) (*RpayMBBank, error) {
	for _, key := range []string{"password", "accountNumber", "token", "vndPerUsdt"} {
		if strings.TrimSpace(config[key]) == "" {
			return nil, fmt.Errorf("rpay mbbank config missing required key: %s", key)
		}
	}
	vndPerUsdt, err := strconv.ParseFloat(strings.TrimSpace(config["vndPerUsdt"]), 64)
	if err != nil || vndPerUsdt <= 0 {
		return nil, fmt.Errorf("rpay mbbank vndPerUsdt must be a positive number")
	}
	cfg := cloneStringMap(config)
	apiBase := strings.TrimSpace(cfg["apiBase"])
	if apiBase == "" {
		apiBase = rpayMBBankDefaultAPIBase
	}
	parsed, err := url.Parse(apiBase)
	if err != nil || parsed.Scheme != "https" || parsed.Host == "" {
		return nil, fmt.Errorf("rpay mbbank apiBase must be an HTTPS URL")
	}
	parsed.RawQuery = ""
	parsed.Fragment = ""
	parsed.Path = strings.TrimRight(parsed.Path, "/")
	cfg["apiBase"] = strings.TrimRight(parsed.String(), "/")
	cfg["currency"] = "VND"
	return &RpayMBBank{
		instanceID: instanceID,
		config:     cfg,
		httpClient: &http.Client{Timeout: rpayMBBankHTTPTimeout},
	}, nil
}

func (r *RpayMBBank) Name() string        { return "Rpay MBBank" }
func (r *RpayMBBank) ProviderKey() string { return payment.TypeRpayMBBank }
func (r *RpayMBBank) SupportedTypes() []payment.PaymentType {
	return []payment.PaymentType{payment.TypeRpayMBBank}
}

func (r *RpayMBBank) CreatePayment(_ context.Context, req payment.CreatePaymentRequest) (*payment.CreatePaymentResponse, error) {
	amount, err := payment.AmountToMinorUnit(req.Amount, "VND")
	if err != nil || amount <= 0 {
		return nil, fmt.Errorf("rpay mbbank create payment: invalid VND amount %s", req.Amount)
	}
	query := url.Values{}
	query.Set("amount", strconv.FormatInt(amount, 10))
	query.Set("addInfo", req.OrderID)
	if accountName := strings.TrimSpace(r.config["accountName"]); accountName != "" {
		query.Set("accountName", accountName)
	}
	payURL := "https://img.vietqr.io/image/MB-" + url.PathEscape(strings.TrimSpace(r.config["accountNumber"])) + "-compact2.png?" + query.Encode()
	return &payment.CreatePaymentResponse{QRCode: payURL, Currency: "VND"}, nil
}

func (r *RpayMBBank) MerchantIdentityMetadata() map[string]string {
	return map[string]string{
		"currency":       "VND",
		"account_number": strings.TrimSpace(r.config["accountNumber"]),
	}
}

func (r *RpayMBBank) QueryOrder(ctx context.Context, orderID string) (*payment.QueryOrderResponse, error) {
	orderID = strings.TrimSpace(orderID)
	if orderID == "" {
		return nil, fmt.Errorf("rpay mbbank query: order ID is required")
	}
	history, err := r.fetchHistory(ctx)
	if err != nil {
		return nil, err
	}
	for _, transaction := range history.Transactions {
		if !strings.EqualFold(strings.TrimSpace(transaction.Type), "IN") || !containsOrderCode(transaction.Description, orderID) {
			continue
		}
		return &payment.QueryOrderResponse{
			TradeNo:  transaction.TransactionID,
			Status:   payment.ProviderStatusPaid,
			Amount:   transaction.Amount,
			PaidAt:   transaction.TransactionDate,
			Metadata: r.MerchantIdentityMetadata(),
		}, nil
	}
	return &payment.QueryOrderResponse{Status: payment.ProviderStatusPending}, nil
}

func (r *RpayMBBank) fetchHistory(ctx context.Context) (*rpayMBBankHistoryResponse, error) {
	endpoint := r.config["apiBase"] + "/historyapimbbankv3/" +
		url.PathEscape(strings.TrimSpace(r.config["password"])) + "/" +
		url.PathEscape(strings.TrimSpace(r.config["accountNumber"])) + "/" +
		url.PathEscape(strings.TrimSpace(r.config["token"]))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("rpay mbbank query: build request: %w", err)
	}
	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("rpay mbbank query: request failed: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, rpayMBBankMaxResponse+1))
	if err != nil {
		return nil, fmt.Errorf("rpay mbbank query: read response: %w", err)
	}
	if len(body) > rpayMBBankMaxResponse {
		return nil, fmt.Errorf("rpay mbbank query: response too large")
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("rpay mbbank query: upstream returned HTTP %d", resp.StatusCode)
	}
	var history rpayMBBankHistoryResponse
	if err := json.Unmarshal(body, &history); err != nil {
		return nil, fmt.Errorf("rpay mbbank query: parse response: %w", err)
	}
	if !strings.EqualFold(strings.TrimSpace(history.Status), "success") {
		return nil, fmt.Errorf("rpay mbbank query: upstream status %q", history.Status)
	}
	return &history, nil
}

func containsOrderCode(description, orderID string) bool {
	pattern := `(?i)(^|[^a-z0-9_-])` + regexp.QuoteMeta(orderID) + `([^a-z0-9_-]|$)`
	return regexp.MustCompile(pattern).MatchString(description)
}

func (r *RpayMBBank) VerifyNotification(context.Context, string, map[string]string) (*payment.PaymentNotification, error) {
	return nil, nil
}

func (r *RpayMBBank) Refund(context.Context, payment.RefundRequest) (*payment.RefundResponse, error) {
	return nil, fmt.Errorf("rpay mbbank refund is not supported")
}
