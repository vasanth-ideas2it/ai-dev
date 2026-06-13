package com.crm.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record DealSummary(
        UUID id,
        String title,
        BigDecimal value,
        String currency,
        UUID stageId,
        int probability,
        UUID ownerId,
        String ownerName
) {}
