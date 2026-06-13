-- Reset all data between integration tests.
-- CASCADE handles FK ordering automatically.
TRUNCATE TABLE
    contact_tags,
    activities,
    tasks,
    audit_logs,
    deals,
    contacts,
    companies,
    tags,
    pipeline_stages,
    pipelines,
    refresh_tokens,
    users,
    organizations
CASCADE;
