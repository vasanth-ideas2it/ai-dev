package com.crm.controller;

import com.crm.dto.*;
import com.crm.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> findAll(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC)
            Pageable pageable,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(companyService.findAll(pageable, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(companyService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyResponse>> create(
            @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(companyService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(companyService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        companyService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
