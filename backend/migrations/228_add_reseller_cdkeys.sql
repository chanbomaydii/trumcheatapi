ALTER TABLE redeem_codes
    ADD COLUMN IF NOT EXISTS source VARCHAR(32) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS created_by_reseller_id BIGINT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'redeem_codes_created_by_reseller_id_fkey'
    ) THEN
        ALTER TABLE redeem_codes
            ADD CONSTRAINT redeem_codes_created_by_reseller_id_fkey
            FOREIGN KEY (created_by_reseller_id) REFERENCES users(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS redeem_codes_source_idx
    ON redeem_codes(source);

CREATE INDEX IF NOT EXISTS redeem_codes_created_by_reseller_id_status_idx
    ON redeem_codes(created_by_reseller_id, status);

COMMENT ON COLUMN redeem_codes.source IS 'Origin of the code: system or reseller_cdkey';
COMMENT ON COLUMN redeem_codes.created_by_reseller_id IS 'Owning reseller for immutable reseller CDKeys';

CREATE TABLE IF NOT EXISTS reseller_balance_ledger (
    id BIGSERIAL PRIMARY KEY,
    reseller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    target_user_id BIGINT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(32) NOT NULL,
    idempotency_key VARCHAR(128) NOT NULL,
    amount DECIMAL(20,8) NOT NULL CHECK (amount > 0),
    code_count INTEGER NULL CHECK (code_count IS NULL OR code_count > 0),
    reseller_balance_before DECIMAL(20,8) NOT NULL,
    reseller_balance_after DECIMAL(20,8) NOT NULL,
    target_balance_before DECIMAL(20,8) NULL,
    target_balance_after DECIMAL(20,8) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (reseller_id, idempotency_key)
);

ALTER TABLE redeem_codes
    ADD COLUMN IF NOT EXISTS reseller_ledger_id BIGINT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'redeem_codes_reseller_ledger_id_fkey'
    ) THEN
        ALTER TABLE redeem_codes
            ADD CONSTRAINT redeem_codes_reseller_ledger_id_fkey
            FOREIGN KEY (reseller_ledger_id) REFERENCES reseller_balance_ledger(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS redeem_codes_reseller_ledger_id_idx
    ON redeem_codes(reseller_ledger_id);

CREATE INDEX IF NOT EXISTS reseller_balance_ledger_target_user_id_idx
    ON reseller_balance_ledger(target_user_id);