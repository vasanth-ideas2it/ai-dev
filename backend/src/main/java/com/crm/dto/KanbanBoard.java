package com.crm.dto;

import java.util.List;
import java.util.UUID;

public record KanbanBoard(
        UUID pipelineId,
        String pipelineName,
        List<KanbanColumn> columns
) {}
