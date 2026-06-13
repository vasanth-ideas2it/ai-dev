-- Extend the activities.type check constraint to include STAGE_CHANGED.
ALTER TABLE activities DROP CONSTRAINT activities_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_type_check
    CHECK (type IN ('CALL', 'EMAIL', 'NOTE', 'MEETING', 'STAGE_CHANGED'));
