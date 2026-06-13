package com.crm.repository;

import com.crm.entity.PipelineStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PipelineStageRepository extends JpaRepository<PipelineStage, UUID> {
    List<PipelineStage> findAllByPipeline_IdOrderByStageOrderAsc(UUID pipelineId);
    Optional<PipelineStage> findByIdAndOrgId(UUID id, UUID orgId);
    void deleteAllByPipeline_Id(UUID pipelineId);
}
