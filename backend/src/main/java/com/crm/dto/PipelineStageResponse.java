package com.crm.dto;

import java.time.Instant;
import java.util.UUID;

public record PipelineStageResponse(
        UUID id,
        UUID orgId,
        UUID pipelineId,
        String name,
        int stageOrder,
        int probability,
        String color,
        Instant createdAt,
        Instant updatedAt
) {}
