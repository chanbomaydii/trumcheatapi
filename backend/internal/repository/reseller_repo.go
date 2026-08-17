package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	dbent "github.com/Wei-Shaw/sub2api/ent"
	"github.com/Wei-Shaw/sub2api/ent/redeemcode"
	"github.com/Wei-Shaw/sub2api/internal/pkg/pagination"
	"github.com/Wei-Shaw/sub2api/internal/service"
)

type resellerRepository struct {
	client *dbent.Client
}

func queryOne(ctx context.Context, client *dbent.Client, query string, args []any, dest ...any) error {
	rows, err := client.QueryContext(ctx, query, args...)
	if err != nil {
		return err
	}
	defer func() { _ = rows.Close() }()
	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return err
		}
		return sql.ErrNoRows
	}
	if err := rows.Scan(dest...); err != nil {
		return err
	}
	return rows.Err()
}

func NewResellerRepository(client *dbent.Client) service.ResellerRepository {
	return &resellerRepository{client: client}
}

func (r *resellerRepository) GetProfile(ctx context.Context, resellerID int64) (*service.User, *service.AffiliateSummary, error) {
	entity, err := r.client.User.Get(ctx, resellerID)
	if err != nil || entity.Role != service.RoleReseller {
		if err != nil && !dbent.IsNotFound(err) {
			return nil, nil, err
		}
		return nil, nil, service.ErrResellerRequired
	}
	affiliate, err := ensureUserAffiliateWithClient(ctx, r.client, resellerID)
	if err != nil {
		return nil, nil, err
	}
	return userEntityToService(entity), affiliate, nil
}

func (r *resellerRepository) ListUsers(ctx context.Context, resellerID int64, params pagination.PaginationParams) ([]service.ResellerUser, *pagination.PaginationResult, error) {
	rows, err := r.client.QueryContext(ctx, `
SELECT COUNT(*) OVER(), u.id, COALESCE(u.email, ''), COALESCE(u.username, ''), u.status,
       u.balance::double precision, u.total_recharged::double precision, ua.created_at
FROM user_affiliates ua
JOIN users u ON u.id = ua.user_id AND u.deleted_at IS NULL
WHERE ua.inviter_id = $1
ORDER BY ua.created_at DESC, u.id DESC
OFFSET $2 LIMIT $3`, resellerID, params.Offset(), params.Limit())
	if err != nil {
		return nil, nil, err
	}
	defer func() { _ = rows.Close() }()

	items := make([]service.ResellerUser, 0)
	var total int64
	for rows.Next() {
		var item service.ResellerUser
		if err := rows.Scan(&total, &item.ID, &item.Email, &item.Username, &item.Status, &item.Balance, &item.TotalRecharged, &item.InvitedAt); err != nil {
			return nil, nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, nil, err
	}
	return items, paginationResultFromTotal(total, params), nil
}

func (r *resellerRepository) GetUser(ctx context.Context, resellerID, userID int64) (*service.ResellerUser, error) {
	var item service.ResellerUser
	err := queryOne(ctx, r.client, `
SELECT u.id, COALESCE(u.email, ''), COALESCE(u.username, ''), u.status,
       u.balance::double precision, u.total_recharged::double precision, ua.created_at
FROM user_affiliates ua
JOIN users u ON u.id = ua.user_id AND u.deleted_at IS NULL
WHERE ua.inviter_id = $1 AND ua.user_id = $2`, []any{resellerID, userID},
		&item.ID, &item.Email, &item.Username, &item.Status, &item.Balance, &item.TotalRecharged, &item.InvitedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, service.ErrResellerUserNotOwned
		}
		return nil, err
	}
	return &item, nil
}

func (r *resellerRepository) TransferBalance(ctx context.Context, resellerID, userID int64, amount float64, idempotencyKey string) (*service.ResellerTransferResult, error) {
	tx, err := r.client.Tx(ctx)
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback() }()
	txCtx := dbent.NewTxContext(ctx, tx)

	if replay, err := queryTransferReplay(txCtx, tx.Client(), resellerID, idempotencyKey, userID, amount); err != nil || replay != nil {
		return replay, err
	}
	var resellerBefore, targetBefore float64
	var role, resellerStatus, targetStatus string
	if err := queryOne(txCtx, tx.Client(), `SELECT role, status, balance::double precision FROM users WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`, []any{resellerID}, &role, &resellerStatus, &resellerBefore); err != nil {
		return nil, service.ErrResellerRequired
	}
	if role != service.RoleReseller || resellerStatus != service.StatusActive {
		return nil, service.ErrResellerRequired
	}
	if replay, err := queryTransferReplay(txCtx, tx.Client(), resellerID, idempotencyKey, userID, amount); err != nil || replay != nil {
		return replay, err
	}
	if err := queryOne(txCtx, tx.Client(), `
SELECT u.status, u.balance::double precision
FROM users u JOIN user_affiliates ua ON ua.user_id = u.id
WHERE u.id = $1 AND ua.inviter_id = $2 AND u.deleted_at IS NULL
FOR UPDATE OF u`, []any{userID, resellerID}, &targetStatus, &targetBefore); err != nil {
		return nil, service.ErrResellerUserNotOwned
	}
	if targetStatus != service.StatusActive {
		return nil, service.ErrResellerUserNotOwned
	}

	res, err := tx.Client().ExecContext(txCtx, `UPDATE users SET balance = balance - $1, updated_at = NOW() WHERE id = $2 AND balance >= $1`, amount, resellerID)
	if err != nil {
		return nil, err
	}
	if affected, _ := res.RowsAffected(); affected != 1 {
		return nil, service.ErrInsufficientBalance
	}
	if _, err := tx.Client().ExecContext(txCtx, `UPDATE users SET balance = balance + $1, total_recharged = total_recharged + $1, updated_at = NOW() WHERE id = $2`, amount, userID); err != nil {
		return nil, err
	}

	result := &service.ResellerTransferResult{Amount: amount, ResellerBalanceAfter: resellerBefore - amount, TargetBalanceAfter: targetBefore + amount}
	if err := queryOne(txCtx, tx.Client(), `
INSERT INTO reseller_balance_ledger (reseller_id, target_user_id, action, idempotency_key, amount, reseller_balance_before, reseller_balance_after, target_balance_before, target_balance_after)
VALUES ($1, $2, 'transfer', $3, $4, $5, $6, $7, $8) RETURNING id`, []any{resellerID, userID, idempotencyKey, amount, resellerBefore, result.ResellerBalanceAfter, targetBefore, result.TargetBalanceAfter}, &result.LedgerID); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return result, nil
}

func queryTransferReplay(ctx context.Context, client *dbent.Client, resellerID int64, key string, expectedUserID int64, expectedAmount float64) (*service.ResellerTransferResult, error) {
	var result service.ResellerTransferResult
	var targetUserID int64
	var action string
	err := queryOne(ctx, client, `SELECT id, action, COALESCE(target_user_id, 0), amount::double precision, reseller_balance_after::double precision, COALESCE(target_balance_after, 0)::double precision FROM reseller_balance_ledger WHERE reseller_id = $1 AND idempotency_key = $2`, []any{resellerID, key}, &result.LedgerID, &action, &targetUserID, &result.Amount, &result.ResellerBalanceAfter, &result.TargetBalanceAfter)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if action != "transfer" || targetUserID != expectedUserID || result.Amount != expectedAmount {
		return nil, service.ErrIdempotencyKeyConflict
	}
	result.Replayed = true
	return &result, nil
}

func (r *resellerRepository) CreateCDKeyBatch(ctx context.Context, resellerID int64, value float64, codes []service.RedeemCode, idempotencyKey string) (*service.ResellerCDKeyBatchResult, error) {
	tx, err := r.client.Tx(ctx)
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback() }()
	txCtx := dbent.NewTxContext(ctx, tx)

	if replay, err := queryCDKeyReplay(txCtx, tx.Client(), resellerID, idempotencyKey, len(codes), value*float64(len(codes))); err != nil || replay != nil {
		return replay, err
	}
	var before float64
	var role, status string
	if err := queryOne(txCtx, tx.Client(), `SELECT role, status, balance::double precision FROM users WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`, []any{resellerID}, &role, &status, &before); err != nil || role != service.RoleReseller || status != service.StatusActive {
		return nil, service.ErrResellerRequired
	}
	if replay, err := queryCDKeyReplay(txCtx, tx.Client(), resellerID, idempotencyKey, len(codes), value*float64(len(codes))); err != nil || replay != nil {
		return replay, err
	}
	total := value * float64(len(codes))
	res, err := tx.Client().ExecContext(txCtx, `UPDATE users SET balance = balance - $1, updated_at = NOW() WHERE id = $2 AND balance >= $1`, total, resellerID)
	if err != nil {
		return nil, err
	}
	if affected, _ := res.RowsAffected(); affected != 1 {
		return nil, service.ErrInsufficientBalance
	}

	result := &service.ResellerCDKeyBatchResult{TotalValue: total, ResellerBalanceAfter: before - total}
	if err := queryOne(txCtx, tx.Client(), `
INSERT INTO reseller_balance_ledger (reseller_id, action, idempotency_key, amount, code_count, reseller_balance_before, reseller_balance_after)
VALUES ($1, 'cdkey_batch', $2, $3, $4, $5, $6) RETURNING id`, []any{resellerID, idempotencyKey, total, len(codes), before, result.ResellerBalanceAfter}, &result.LedgerID); err != nil {
		return nil, err
	}

	builders := make([]*dbent.RedeemCodeCreate, 0, len(codes))
	for i := range codes {
		builders = append(builders, tx.Client().RedeemCode.Create().SetCode(codes[i].Code).SetType(service.RedeemTypeBalance).SetSource(service.RedeemSourceResellerCDKey).SetValue(value).SetStatus(service.StatusUnused).SetCreatedByResellerID(resellerID).SetResellerLedgerID(result.LedgerID).SetValidityDays(0).SetNillableExpiresAt(codes[i].ExpiresAt))
	}
	created, err := tx.Client().RedeemCode.CreateBulk(builders...).Save(txCtx)
	if err != nil {
		return nil, err
	}
	result.Codes = redeemCodeEntitiesToService(created)
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return result, nil
}

func queryCDKeyReplay(ctx context.Context, client *dbent.Client, resellerID int64, key string, expectedCount int, expectedTotal float64) (*service.ResellerCDKeyBatchResult, error) {
	var result service.ResellerCDKeyBatchResult
	var count int
	var action string
	err := queryOne(ctx, client, `SELECT id, action, amount::double precision, COALESCE(code_count, 0), reseller_balance_after::double precision FROM reseller_balance_ledger WHERE reseller_id = $1 AND idempotency_key = $2`, []any{resellerID, key}, &result.LedgerID, &action, &result.TotalValue, &count, &result.ResellerBalanceAfter)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if action != "cdkey_batch" || count != expectedCount || result.TotalValue != expectedTotal {
		return nil, service.ErrIdempotencyKeyConflict
	}
	entities, err := client.RedeemCode.Query().Where(redeemcode.ResellerLedgerIDEQ(result.LedgerID), redeemcode.CreatedByResellerIDEQ(resellerID)).Order(dbent.Asc(redeemcode.FieldID)).All(ctx)
	if err != nil {
		return nil, err
	}
	result.Codes = redeemCodeEntitiesToService(entities)
	result.Replayed = true
	return &result, nil
}

func (r *resellerRepository) ListCDKeys(ctx context.Context, resellerID int64, params pagination.PaginationParams, status, search string) ([]service.RedeemCode, *pagination.PaginationResult, error) {
	q := r.client.RedeemCode.Query().Where(redeemcode.CreatedByResellerIDEQ(resellerID), redeemcode.SourceEQ(service.RedeemSourceResellerCDKey))
	if status != "" {
		q.Where(redeemcode.StatusEQ(status))
	}
	if search = strings.TrimSpace(search); search != "" {
		q.Where(redeemcode.CodeContainsFold(search))
	}
	total, err := q.Count(ctx)
	if err != nil {
		return nil, nil, err
	}
	entities, err := q.WithUser().Order(dbent.Desc(redeemcode.FieldID)).Offset(params.Offset()).Limit(params.Limit()).All(ctx)
	if err != nil {
		return nil, nil, err
	}
	return redeemCodeEntitiesToService(entities), paginationResultFromTotal(int64(total), params), nil
}

func (r *resellerRepository) GetCDKey(ctx context.Context, resellerID, codeID int64) (*service.RedeemCode, error) {
	entity, err := r.client.RedeemCode.Query().Where(redeemcode.IDEQ(codeID), redeemcode.CreatedByResellerIDEQ(resellerID), redeemcode.SourceEQ(service.RedeemSourceResellerCDKey)).WithUser().Only(ctx)
	if dbent.IsNotFound(err) {
		return nil, service.ErrRedeemCodeNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get reseller CDKey: %w", err)
	}
	return redeemCodeEntityToService(entity), nil
}
