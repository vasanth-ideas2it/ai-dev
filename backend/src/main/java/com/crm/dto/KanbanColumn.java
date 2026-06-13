package com.crm.dto;

import java.util.List;
import java.util.UUID;

public record KanbanColumn(
        UUID stageId,
        String stageName,
        int stageOrder,
        int probability,
        String color,
        List<DealSummary> deals
) {}
