package com.crm.dto;

import java.time.Instant;
import java.util.UUID;

public record CompanyResponse(
        UUID id,
        UUID orgId,
        String name,
        String industry,
        String website,
        String phone,
        String address,
        Instant createdAt,
        Instant updatedAt
) {}
