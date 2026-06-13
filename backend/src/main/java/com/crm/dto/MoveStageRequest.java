package com.crm.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MoveStageRequest(@NotNull UUID stageId) {}
