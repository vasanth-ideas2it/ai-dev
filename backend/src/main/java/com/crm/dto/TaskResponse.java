package com.crm.dto;

import com.crm.entity.TaskStatus;

import java.time.Instant;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID orgId,
        String title,
        Instant dueDate,
        TaskStatus status,
        UUID assigneeId,
        String assigneeName,
        UUID contactId,
        UUID dealId,
        Instant createdAt,
        Instant updatedAt
) {}
