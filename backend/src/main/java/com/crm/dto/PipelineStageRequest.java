package com.crm.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record PipelineStageRequest(
        UUID id,
        @NotBlank String name,
        int stageOrder,
        @Min(0) @Max(100) int probability,
        String color
) {}
