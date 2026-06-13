-- ============================================================
-- V1__init_schema.sql — CRM initial schema
-- PostgreSQL 16: gen_random_uuid() is a core built-in, no extension needed.
-- All FKs use ON DELETE RESTRICT to protect data integrity.
-- ============================================================

-- ── updated_at trigger (applied to every table that has the column) ──────────
CREATE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ── Organizations ─────────────────────────────────────────────────────────────
CREATE TABLE organizations (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    plan       VARCHAR(20)  NOT NULL DEFAULT 'FREE'
                            CHECK (plan IN ('FREE','STARTER','PRO','ENTERPRISE')),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_organizations PRIMARY KEY (id)
);

CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    org_id        UUID         NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN','MANAGER','REP')),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_users       PRIMARY KEY (id),
    CONSTRAINT fk_users_org   FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX idx_users_org_id ON users(org_id);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Companies ─────────────────────────────────────────────────────────────────
CREATE TABLE companies (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    org_id     UUID         NOT NULL,
    name       VARCHAR(255) NOT NULL,
    industry   VARCHAR(100),
    website    VARCHAR(255),
    phone      VARCHAR(50),
    address    TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_companies     PRIMARY KEY (id),
    CONSTRAINT fk_companies_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE RESTRICT
);

CREATE INDEX idx_companies_org_id      ON companies(org_id);
CREATE INDEX idx_companies_org_deleted ON companies(org_id, deleted_at);

CREATE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Contacts ──────────────────────────────────────────────────────────────────
CREATE TABLE contacts (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    org_id     UUID         NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100),
    email      VARCHAR(255),
    phone      VARCHAR(50),
    notes      TEXT,
    company_id UUID,
    owner_id   UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_contacts       PRIMARY KEY (id),
    CONSTRAINT fk_contacts_org   FOREIGN KEY (org_id)     REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_contacts_co    FOREIGN KEY (company_id) REFERENCES companies(id)     ON DELETE RESTRICT,
    CONSTRAINT fk_contacts_owner FOREIGN KEY (owner_id)   REFERENCES users(id)         ON DELETE RESTRICT
);

CREATE INDEX idx_contacts_org_id      ON contacts(org_id);
CREATE INDEX idx_contacts_email       ON contacts(email);
CREATE INDEX idx_contacts_company_id  ON contacts(company_id);
CREATE INDEX idx_contacts_owner_id    ON contacts(owner_id);
CREATE INDEX idx_contacts_org_deleted ON contacts(org_id, deleted_at);

CREATE TRIGGER trg_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Tags ──────────────────────────────────────────────────────────────────────
CREATE TABLE tags (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    org_id     UUID         NOT NULL,
    name       VARCHAR(100) NOT NULL,
    color      VARCHAR(7),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_tags          PRIMARY KEY (id),
    CONSTRAINT fk_tags_org      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT uq_tags_org_name UNIQUE (org_id, name)
);

CREATE INDEX idx_tags_org_id ON tags(org_id);

CREATE TRIGGER trg_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Contact Tags (junction) ───────────────────────────────────────────────────
-- No org_id: org is implicit via contact. No updated_at: append-only.
CREATE TABLE contact_tags (
    contact_id UUID        NOT NULL,
    tag_id     UUID        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_contact_tags PRIMARY KEY (contact_id, tag_id),
    CONSTRAINT fk_ct_contact   FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ct_tag       FOREIGN KEY (tag_id)     REFERENCES tags(id)     ON DELETE RESTRICT
);

CREATE INDEX idx_contact_tags_tag ON contact_tags(tag_id);

-- ── Pipelines ─────────────────────────────────────────────────────────────────
CREATE TABLE pipelines (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    org_id     UUID         NOT NULL,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_pipelines     PRIMARY KEY (id),
    CONSTRAINT fk_pipelines_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE RESTRICT
);

CREATE INDEX idx_pipelines_org_id ON pipelines(org_id);

CREATE TRIGGER trg_pipelines_updated_at
    BEFORE UPDATE ON pipelines
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Pipeline Stages ───────────────────────────────────────────────────────────
-- stage_order avoids quoting the reserved word "order".
CREATE TABLE pipeline_stages (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    org_id      UUID         NOT NULL,
    pipeline_id UUID         NOT NULL,
    name        VARCHAR(100) NOT NULL,
    stage_order INTEGER      NOT NULL,
    probability INTEGER      NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
    color       VARCHAR(7),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_pipeline_stages  PRIMARY KEY (id),
    CONSTRAINT fk_stages_org       FOREIGN KEY (org_id)      REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_stages_pipeline  FOREIGN KEY (pipeline_id) REFERENCES pipelines(id)     ON DELETE RESTRICT
);

CREATE INDEX idx_pipeline_stages_org_id      ON pipeline_stages(org_id);
CREATE INDEX idx_pipeline_stages_pipeline_id ON pipeline_stages(pipeline_id);

CREATE TRIGGER trg_pipeline_stages_updated_at
    BEFORE UPDATE ON pipeline_stages
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Deals ─────────────────────────────────────────────────────────────────────
CREATE TABLE deals (
    id          UUID          NOT NULL DEFAULT gen_random_uuid(),
    org_id      UUID          NOT NULL,
    title       VARCHAR(255)  NOT NULL,
    value       NUMERIC(15,2) NOT NULL DEFAULT 0,
    currency    VARCHAR(3)    NOT NULL DEFAULT 'USD',
    stage_id    UUID          NOT NULL,
    contact_id  UUID,
    company_id  UUID,
    owner_id    UUID          NOT NULL,
    close_date  DATE,
    probability INTEGER       NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_deals         PRIMARY KEY (id),
    CONSTRAINT fk_deals_org     FOREIGN KEY (org_id)     REFERENCES organizations(id)   ON DELETE RESTRICT,
    CONSTRAINT fk_deals_stage   FOREIGN KEY (stage_id)   REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
    CONSTRAINT fk_deals_contact FOREIGN KEY (contact_id) REFERENCES contacts(id)        ON DELETE RESTRICT,
    CONSTRAINT fk_deals_company FOREIGN KEY (company_id) REFERENCES companies(id)       ON DELETE RESTRICT,
    CONSTRAINT fk_deals_owner   FOREIGN KEY (owner_id)   REFERENCES users(id)           ON DELETE RESTRICT
);

CREATE INDEX idx_deals_org_id      ON deals(org_id);
CREATE INDEX idx_deals_stage_id    ON deals(stage_id);
CREATE INDEX idx_deals_contact_id  ON deals(contact_id);
CREATE INDEX idx_deals_company_id  ON deals(company_id);
CREATE INDEX idx_deals_owner_id    ON deals(owner_id);
CREATE INDEX idx_deals_org_deleted ON deals(org_id, deleted_at);

CREATE TRIGGER trg_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Activities ────────────────────────────────────────────────────────────────
CREATE TABLE activities (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    org_id     UUID        NOT NULL,
    type       VARCHAR(20) NOT NULL CHECK (type IN ('CALL','EMAIL','NOTE','MEETING')),
    body       TEXT,
    contact_id UUID,
    deal_id    UUID,
    user_id    UUID        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_activities         PRIMARY KEY (id),
    CONSTRAINT fk_activities_org     FOREIGN KEY (org_id)     REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_activities_contact FOREIGN KEY (contact_id) REFERENCES contacts(id)      ON DELETE RESTRICT,
    CONSTRAINT fk_activities_deal    FOREIGN KEY (deal_id)    REFERENCES deals(id)         ON DELETE RESTRICT,
    CONSTRAINT fk_activities_user    FOREIGN KEY (user_id)    REFERENCES users(id)         ON DELETE RESTRICT
);

CREATE INDEX idx_activities_org_id     ON activities(org_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_deal_id    ON activities(deal_id);
CREATE INDEX idx_activities_user_id    ON activities(user_id);

CREATE TRIGGER trg_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Tasks ─────────────────────────────────────────────────────────────────────
CREATE TABLE tasks (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    org_id      UUID         NOT NULL,
    title       VARCHAR(255) NOT NULL,
    due_date    TIMESTAMPTZ,
    status      VARCHAR(20)  NOT NULL DEFAULT 'TODO'
                             CHECK (status IN ('TODO','IN_PROGRESS','DONE')),
    assignee_id UUID,
    contact_id  UUID,
    deal_id     UUID,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_tasks          PRIMARY KEY (id),
    CONSTRAINT fk_tasks_org      FOREIGN KEY (org_id)      REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users(id)         ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_contact  FOREIGN KEY (contact_id)  REFERENCES contacts(id)      ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_deal     FOREIGN KEY (deal_id)     REFERENCES deals(id)         ON DELETE RESTRICT
);

CREATE INDEX idx_tasks_org_id      ON tasks(org_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_contact_id  ON tasks(contact_id);
CREATE INDEX idx_tasks_deal_id     ON tasks(deal_id);

CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Audit Logs ────────────────────────────────────────────────────────────────
-- user_id nullable: system-initiated mutations have no acting user.
-- diff uses JSONB for efficient field-level querying via GIN index.
-- updated_at present for schema consistency; audit rows are never updated.
CREATE TABLE audit_logs (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    org_id      UUID         NOT NULL,
    user_id     UUID,
    action      VARCHAR(50)  NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id   UUID         NOT NULL,
    diff        JSONB,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_audit_logs      PRIMARY KEY (id),
    CONSTRAINT fk_audit_logs_org  FOREIGN KEY (org_id)  REFERENCES organizations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)         ON DELETE RESTRICT
);

CREATE INDEX idx_audit_logs_org_id  ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity  ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_diff    ON audit_logs USING gin(diff);

CREATE TRIGGER trg_audit_logs_updated_at
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
