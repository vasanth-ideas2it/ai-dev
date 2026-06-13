package com.crm.controller;

import com.crm.dto.*;
import com.crm.service.PipelineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pipelines")
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PipelineResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PipelineResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PipelineResponse>> create(
            @Valid @RequestBody PipelineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(pipelineService.create(request)));
    }

    @PutMapping("/{id}/stages")
    public ResponseEntity<ApiResponse<PipelineResponse>> replaceStages(
            @PathVariable UUID id,
            @Valid @RequestBody PipelineStagesRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(pipelineService.replaceStages(id, request)));
    }
}
