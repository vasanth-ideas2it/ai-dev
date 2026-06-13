package com.crm.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record PipelineRequest(
        @NotBlank String name,
        @Valid List<PipelineStageRequest> stages
) {}
