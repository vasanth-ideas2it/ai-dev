package com.crm.aspect;

import com.crm.entity.AuditLog;
import com.crm.security.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogSaver auditLogSaver;
    private final ObjectMapper  objectMapper;

    @Around("within(@org.springframework.stereotype.Service *) && " +
            "(execution(* create*(..)) || execution(* update*(..)) || execution(* delete*(..)))")
    public Object audit(ProceedingJoinPoint pjp) throws Throwable {
        // Capture identity before proceeding — SecurityContext is on this thread.
        UUID userId = null;
        UUID orgId  = null;
        try {
            userId = SecurityUtils.getCurrentUserId();
            orgId  = SecurityUtils.getCurrentOrgId();
        } catch (Exception ignored) {}

        Object result = pjp.proceed();

        try {
            String className  = pjp.getTarget().getClass().getSimpleName(); // e.g. ContactService
            String entityType = className.replace("Service", "");            // e.g. Contact
            String methodName = pjp.getSignature().getName();
            String action     = deriveAction(methodName);
            UUID   entityId   = extractEntityId(result, pjp.getArgs());
            String diff       = serializeDiff(result, action);

            if (orgId != null && entityId != null) {
                auditLogSaver.save(AuditLog.builder()
                        .orgId(orgId)
                        .userId(userId)
                        .action(action)
                        .entityType(entityType)
                        .entityId(entityId)
                        .diff(diff)
                        .build());
            }
        } catch (Exception ex) {
            log.warn("AuditAspect failed to record log for {}: {}",
                    pjp.getSignature(), ex.getMessage());
        }

        return result;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String deriveAction(String methodName) {
        if (methodName.startsWith("create")) return "CREATE";
        if (methodName.startsWith("update")) return "UPDATE";
        if (methodName.startsWith("delete") || methodName.startsWith("remove")) return "DELETE";
        return methodName.toUpperCase();
    }

    private UUID extractEntityId(Object result, Object[] args) {
        // create / update return a response record with id()
        if (result != null) {
            try {
                Object id = result.getClass().getMethod("id").invoke(result);
                if (id instanceof UUID uuid) return uuid;
                if (id instanceof String s)  return UUID.fromString(s);
            } catch (Exception ignored) {}
        }
        // delete returns void — first arg is the entity UUID
        if (result == null && args.length > 0 && args[0] instanceof UUID uuid) {
            return uuid;
        }
        return null;
    }

    private String serializeDiff(Object result, String action) {
        if ("DELETE".equals(action) || result == null) return null;
        try {
            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            return null;
        }
    }
}
