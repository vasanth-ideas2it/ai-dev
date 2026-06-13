package com.crm.repository;

import com.crm.entity.Pipeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PipelineRepository extends JpaRepository<Pipeline, UUID> {
    List<Pipeline> findAllByOrgId(UUID orgId);
    Optional<Pipeline> findByIdAndOrgId(UUID id, UUID orgId);
}
