ALTER TABLE groups
    ADD COLUMN IF NOT EXISTS token_price_per_million_per_day NUMERIC(20,8) NOT NULL DEFAULT 0;

ALTER TABLE groups
    ADD CONSTRAINT groups_token_price_per_million_per_day_non_negative
    CHECK (token_price_per_million_per_day >= 0);

ALTER TABLE api_keys
    ADD COLUMN IF NOT EXISTS token_unit_price NUMERIC(20,8) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS token_duration_days INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS token_purchase_price NUMERIC(20,8) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS token_purchased_at TIMESTAMPTZ;

ALTER TABLE api_keys
    ADD CONSTRAINT api_keys_token_unit_price_non_negative CHECK (token_unit_price >= 0),
    ADD CONSTRAINT api_keys_token_duration_days_non_negative CHECK (token_duration_days >= 0),
    ADD CONSTRAINT api_keys_token_purchase_price_non_negative CHECK (token_purchase_price >= 0);

DROP INDEX IF EXISTS idx_api_keys_one_token_key_per_user_group;