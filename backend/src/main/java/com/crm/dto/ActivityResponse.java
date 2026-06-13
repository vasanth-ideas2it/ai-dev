package com.crm.dto;

import com.crm.entity.ActivityType;

import java.time.Instant;
import java.util.UUID;

public record ActivityResponse(
        UUID id,
        UUID orgId,
        ActivityType type,
        String body,
        UUID contactId,
        UUID dealId,
        UUID userId,
        String userName,
        Instant createdAt,
        Instant updatedAt
) {}
