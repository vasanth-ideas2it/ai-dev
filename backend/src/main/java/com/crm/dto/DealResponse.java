package com.crm.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record DealResponse(
        UUID id,
        UUID orgId,
        String title,
        BigDecimal value,
        String currency,
        UUID stageId,
        String stageName,
        UUID pipelineId,
        UUID contactId,
        String contactName,
        UUID companyId,
        String companyName,
        UUID ownerId,
        String ownerName,
        LocalDate closeDate,
        int probability,
        Instant createdAt,
        Instant updatedAt
) {}
