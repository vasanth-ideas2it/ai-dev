package com.crm.controller;

import com.crm.dto.*;
import com.crm.entity.TaskStatus;
import com.crm.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TaskResponse>>> findAll(
            @PageableDefault(size = 20, sort = "dueDate", direction = Sort.Direction.ASC)
            Pageable pageable,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dueDate,
            @RequestParam(required = false) UUID contactId,
            @RequestParam(required = false) UUID dealId) {
        return ResponseEntity.ok(ApiResponse.ok(
                taskService.findAllFiltered(pageable, status, assigneeId, dueDate, contactId, dealId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> create(
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(taskService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        taskService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<TaskResponse>> complete(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.complete(id)));
    }
}
