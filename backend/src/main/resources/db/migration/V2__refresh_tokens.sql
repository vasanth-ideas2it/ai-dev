-- V2__refresh_tokens.sql — refresh token store for JWT rotation
-- One row per user (UNIQUE on user_id). Replaced on every login and token refresh.
-- token_hash stores SHA-256(raw_jwt) so raw tokens are never at rest in the DB.

CREATE TABLE refresh_tokens (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    org_id     UUID        NOT NULL,
    user_id    UUID        NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_refresh_tokens     PRIMARY KEY (id),
    CONSTRAINT uq_refresh_tokens_uid UNIQUE (user_id),
    CONSTRAINT fk_rt_org             FOREIGN KEY (org_id)  REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_rt_user            FOREIGN KEY (user_id) REFERENCES users(id)         ON DELETE RESTRICT
);

CREATE TRIGGER trg_refresh_tokens_updated_at
    BEFORE UPDATE ON refresh_tokens
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
