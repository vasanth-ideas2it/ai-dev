package com.crm.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PipelineStagesRequest(
        @NotNull @NotEmpty @Valid List<PipelineStageRequest> stages
) {}
