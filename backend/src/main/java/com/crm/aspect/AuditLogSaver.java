package com.crm.aspect;

import com.crm.entity.AuditLog;
import com.crm.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditLogSaver {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void save(AuditLog log) {
        auditLogRepository.save(log);
    }
}
