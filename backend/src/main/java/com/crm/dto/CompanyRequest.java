package com.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 100) String industry,
        @Size(max = 255) String website,
        @Size(max = 50) String phone,
        String address
) {}
