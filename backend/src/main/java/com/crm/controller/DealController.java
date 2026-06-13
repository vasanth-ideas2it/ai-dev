package com.crm.controller;

import com.crm.dto.*;
import com.crm.service.ActivityService;
import com.crm.service.DealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<DealResponse>>> findAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable,
            @RequestParam(required = false) UUID pipelineId,
            @RequestParam(required = false) UUID stageId,
            @RequestParam(required = false) UUID ownerId) {
        return ResponseEntity.ok(ApiResponse.ok(
                dealService.findAllFiltered(pageable, pipelineId, stageId, ownerId)));
    }

    @GetMapping("/kanban")
    public ResponseEntity<ApiResponse<KanbanBoard>> kanban(
            @RequestParam UUID pipelineId) {
        return ResponseEntity.ok(ApiResponse.ok(dealService.kanbanBoard(pipelineId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DealResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(dealService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DealResponse>> create(
            @Valid @RequestBody DealRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(dealService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DealResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody DealRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(dealService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        dealService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{id}/stage")
    public ResponseEntity<ApiResponse<DealResponse>> moveStage(
            @PathVariable UUID id,
            @Valid @RequestBody MoveStageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(dealService.moveDeal(id, request.stageId())));
    }

    @GetMapping("/{id}/activities")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> activities(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(activityService.findByDeal(id)));
    }
}
