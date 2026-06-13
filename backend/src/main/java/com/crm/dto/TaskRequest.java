package com.crm.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.UUID;

public record TaskRequest(
        @NotBlank String title,
        Instant dueDate,
        UUID assigneeId,
        UUID contactId,
        UUID dealId
) {}
