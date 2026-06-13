package com.crm.service;

import com.crm.dto.*;
import com.crm.entity.TaskStatus;
import com.crm.mapper.ActivityMapper;
import com.crm.mapper.TaskMapper;
import com.crm.repository.ActivityRepository;
import com.crm.repository.ContactRepository;
import com.crm.repository.DealRepository;
import com.crm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ContactRepository  contactRepository;
    private final DealRepository     dealRepository;
    private final TaskRepository     taskRepository;
    private final ActivityRepository activityRepository;
    private final ActivityMapper     activityMapper;
    private final TaskMapper         taskMapper;

    @Cacheable(value = "dashboardSummary", key = "#orgId")
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(UUID orgId) {
        Instant startOfMonth = LocalDate.now()
                .withDayOfMonth(1)
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);

        long newContacts   = contactRepository.countNewSince(orgId, startOfMonth);
        long openDeals     = dealRepository.countByOrgId(orgId);
        BigDecimal total   = dealRepository.sumValueByOrgId(orgId);
        long overdue       = taskRepository.countOverdue(orgId, TaskStatus.DONE, Instant.now());

        return new DashboardSummaryResponse(newContacts, openDeals, total, overdue);
    }

    @Cacheable(value = "dashboardByStage", key = "#orgId + ':' + #pipelineId")
    @Transactional(readOnly = true)
    public List<DealsByStageResponse> getDealsByStage(UUID orgId, UUID pipelineId) {
        return dealRepository.dealsByStageRaw(orgId, pipelineId).stream()
                .map(row -> new DealsByStageResponse(
                        (UUID)   row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        toBigDecimal(row[3])
                ))
                .toList();
    }

    @Cacheable(value = "dashboardForecast", key = "#orgId")
    @Transactional(readOnly = true)
    public List<RevenueForecastResponse> getRevenueForecast(UUID orgId) {
        LocalDate since = LocalDate.now().minusMonths(5).withDayOfMonth(1);
        LocalDate until = LocalDate.now().plusMonths(1).withDayOfMonth(1);

        return dealRepository.revenueForecastRaw(orgId, since, until).stream()
                .map(row -> new RevenueForecastResponse(
                        (String) row[0],
                        toBigDecimal(row[1]),
                        toBigDecimal(row[2])
                ))
                .toList();
    }

    @Cacheable(value = "dashboardActivities", key = "#orgId + ':' + #limit")
    @Transactional(readOnly = true)
    public List<ActivityResponse> getRecentActivities(UUID orgId, int limit) {
        Pageable pageable = PageRequest.of(0, Math.min(limit, 50));
        return activityRepository.findRecentByOrgId(orgId, pageable).stream()
                .map(activityMapper::entityToResponse)
                .toList();
    }

    @Cacheable(value = "dashboardOverdue", key = "#orgId + ':' + #size")
    @Transactional(readOnly = true)
    public List<TaskResponse> getOverdueTasks(UUID orgId, int size) {
        Pageable pageable = PageRequest.of(0, Math.min(size, 20));
        return taskRepository.findOverdue(orgId, TaskStatus.DONE, Instant.now(), pageable).stream()
                .map(taskMapper::entityToResponse)
                .toList();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal bd) return bd;
        return new BigDecimal(val.toString());
    }
}
