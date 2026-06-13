package com.crm.controller;

import com.crm.dto.ApiResponse;
import com.crm.dto.AuditLogResponse;
import com.crm.dto.PageMeta;
import com.crm.dto.PagedResponse;
import com.crm.entity.AuditLog;
import com.crm.repository.AuditLogRepository;
import com.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit-log")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogResponse>>> findAll(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        UUID orgId = SecurityUtils.getCurrentOrgId();
        Page<AuditLog> page;

        if (entityType != null && entityId != null) {
            page = auditLogRepository.findByOrgIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(
                    orgId, entityType, entityId, pageable);
        } else if (entityType != null) {
            page = auditLogRepository.findByOrgIdAndEntityTypeOrderByCreatedAtDesc(
                    orgId, entityType, pageable);
        } else {
            page = auditLogRepository.findByOrgIdOrderByCreatedAtDesc(orgId, pageable);
        }

        List<AuditLogResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(new PagedResponse<>(
                content,
                PageMeta.of(pageable.getPageNumber(), pageable.getPageSize(),
                        page.getTotalElements()))));
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),       log.getOrgId(),      log.getUserId(),
                log.getAction(),   log.getEntityType(), log.getEntityId(),
                log.getDiff(),     log.getCreatedAt());
    }
}
