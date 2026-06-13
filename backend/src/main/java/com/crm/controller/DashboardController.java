package com.crm.controller;

import com.crm.dto.*;
import com.crm.security.SecurityUtils;
import com.crm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getSummary(orgId)));
    }

    @GetMapping("/deals-by-stage")
    public ResponseEntity<ApiResponse<List<DealsByStageResponse>>> getDealsByStage(
            @RequestParam UUID pipelineId) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDealsByStage(orgId, pipelineId)));
    }

    @GetMapping("/revenue-forecast")
    public ResponseEntity<ApiResponse<List<RevenueForecastResponse>>> getRevenueForecast() {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getRevenueForecast(orgId)));
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getRecentActivities(
            @RequestParam(defaultValue = "20") int limit) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getRecentActivities(orgId, limit)));
    }

    @GetMapping("/overdue-tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getOverdueTasks(
            @RequestParam(defaultValue = "5") int size) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getOverdueTasks(orgId, size)));
    }
}
