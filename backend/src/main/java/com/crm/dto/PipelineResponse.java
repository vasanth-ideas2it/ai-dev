package com.crm.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PipelineResponse(
        UUID id,
        UUID orgId,
        String name,
        List<PipelineStageResponse> stages,
        Instant createdAt,
        Instant updatedAt
) {}
