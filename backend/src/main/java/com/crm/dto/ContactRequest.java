package com.crm.dto;

import com.crm.validation.ValidPhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ContactRequest(
        @NotBlank @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @Email @Size(max = 255) String email,
        @ValidPhoneNumber @Size(max = 50) String phone,
        String notes,
        UUID companyId,
        UUID ownerId
) {}
