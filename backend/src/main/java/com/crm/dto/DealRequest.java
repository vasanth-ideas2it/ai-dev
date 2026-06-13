package com.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DealRequest(
        @NotBlank String title,
        BigDecimal value,
        String currency,
        @NotNull UUID stageId,
        UUID contactId,
        UUID companyId,
        UUID ownerId,
        LocalDate closeDate
) {}
