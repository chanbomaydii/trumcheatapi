ALTER TABLE groups
    ADD COLUMN IF NOT EXISTS token_limit BIGINT NOT NULL DEFAULT 0;

ALTER TABLE api_keys
    ADD COLUMN IF NOT EXISTS token_quota BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS token_used BIGINT NOT NULL DEFAULT 0;

ALTER TABLE groups
    ADD CONSTRAINT groups_token_limit_non_negative CHECK (token_limit >= 0);

ALTER TABLE api_keys
    ADD CONSTRAINT api_keys_token_quota_non_negative CHECK (token_quota >= 0),
    ADD CONSTRAINT api_keys_token_used_non_negative CHECK (token_used >= 0);

CREATE INDEX IF NOT EXISTS idx_api_keys_token_quota_used
    ON api_keys (token_quota, token_used);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_one_token_key_per_user_group
    ON api_keys (user_id, group_id)
    WHERE deleted_at IS NULL AND token_quota > 0;