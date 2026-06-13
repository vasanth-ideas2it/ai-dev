package com.crm.dto;

import java.util.UUID;

public record ContactSummaryResponse(UUID id, String fullName, String email) {}
