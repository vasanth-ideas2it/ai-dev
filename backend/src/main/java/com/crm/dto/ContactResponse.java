package com.crm.dto;

import java.time.Instant;
import java.util.UUID;

public record ContactResponse(
        UUID id,
        UUID orgId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String notes,
        UUID companyId,
        String companyName,
        UUID ownerId,
        String ownerName,
        Instant createdAt,
        Instant updatedAt
) {}
