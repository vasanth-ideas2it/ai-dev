-- Dev seed: a demo organisation with a default Sales Pipeline.
-- Fixed UUIDs make the migration idempotent across repeated CI runs.
DO $$
DECLARE
    v_org_id  UUID := '00000000-0000-0000-0000-000000000001';
    v_pipe_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
    IF EXISTS (SELECT 1 FROM organizations WHERE id = v_org_id) THEN RETURN; END IF;

    INSERT INTO organizations (id, name, plan)
    VALUES (v_org_id, 'Demo Organisation', 'FREE');

    INSERT INTO pipelines (id, org_id, name)
    VALUES (v_pipe_id, v_org_id, 'Sales Pipeline');

    INSERT INTO pipeline_stages (id, org_id, pipeline_id, name, stage_order, probability, color)
    VALUES
        (gen_random_uuid(), v_org_id, v_pipe_id, 'Lead',        1, 10,  '#9E9E9E'),
        (gen_random_uuid(), v_org_id, v_pipe_id, 'Qualified',   2, 25,  '#2196F3'),
        (gen_random_uuid(), v_org_id, v_pipe_id, 'Proposal',    3, 50,  '#FF9800'),
        (gen_random_uuid(), v_org_id, v_pipe_id, 'Negotiation', 4, 75,  '#9C27B0'),
        (gen_random_uuid(), v_org_id, v_pipe_id, 'Closed Won',  5, 100, '#4CAF50'),
        (gen_random_uuid(), v_org_id, v_pipe_id, 'Closed Lost', 6, 0,   '#F44336');
END
$$;
