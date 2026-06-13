package com.crm.dto;

import com.crm.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String orgName,
        @Email @NotBlank String email,
        @NotBlank @ValidPassword String password,
        @NotBlank String firstName,
        @NotBlank String lastName
) {}
