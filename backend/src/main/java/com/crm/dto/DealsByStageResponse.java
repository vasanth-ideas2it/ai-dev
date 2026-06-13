package com.crm.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record DealsByStageResponse(
        UUID stageId,
        String stageName,
        long count,
        BigDecimal totalValue
) {}
