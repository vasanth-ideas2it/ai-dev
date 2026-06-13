package com.crm.repository;

import com.crm.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByOrgIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(
            UUID orgId, String entityType, UUID entityId, Pageable pageable);

    Page<AuditLog> findByOrgIdAndEntityTypeOrderByCreatedAtDesc(
            UUID orgId, String entityType, Pageable pageable);

    Page<AuditLog> findByOrgIdOrderByCreatedAtDesc(UUID orgId, Pageable pageable);
}
