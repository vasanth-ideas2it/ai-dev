package com.crm.dto;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID    id,
        UUID    orgId,
        UUID    userId,
        String  action,
        String  entityType,
        UUID    entityId,
        String  diff,
        Instant createdAt
) {}
