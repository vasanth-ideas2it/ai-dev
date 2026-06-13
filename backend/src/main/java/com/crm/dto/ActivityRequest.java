package com.crm.dto;

import com.crm.entity.ActivityType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ActivityRequest(
        @NotNull ActivityType type,
        String body,
        UUID contactId,
        UUID dealId
) {}
