package com.crm.mapper;

import com.crm.dto.*;
import com.crm.entity.Pipeline;
import com.crm.entity.PipelineStage;
import com.crm.security.SecurityUtils;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PipelineMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orgId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "stages", ignore = true)
    Pipeline requestToEntity(PipelineRequest request);

    @AfterMapping
    default void setOrgId(@MappingTarget Pipeline pipeline) {
        pipeline.setOrgId(SecurityUtils.getCurrentOrgId());
    }

    PipelineResponse entityToResponse(Pipeline pipeline);

    @Mapping(target = "pipelineId", source = "pipeline.id")
    PipelineStageResponse stageToResponse(PipelineStage stage);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orgId", ignore = true)
    @Mapping(target = "pipeline", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PipelineStage stageRequestToEntity(PipelineStageRequest request);
}
