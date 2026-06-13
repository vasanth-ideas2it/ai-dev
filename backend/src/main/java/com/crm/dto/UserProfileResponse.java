package com.crm.dto;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        UUID orgId,
        String email,
        String firstName,
        String lastName,
        String role
) {}
