package com.crm.controller;

import com.crm.dto.ActivityRequest;
import com.crm.dto.ActivityResponse;
import com.crm.dto.ApiResponse;
import com.crm.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityResponse>> create(
            @Valid @RequestBody ActivityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(activityService.create(request)));
    }
}
