package com.crm.controller;

import com.crm.dto.*;
import com.crm.service.ActivityService;
import com.crm.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ContactResponse>>> findAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID ownerId) {
        return ResponseEntity.ok(ApiResponse.ok(contactService.findAll(pageable, search, ownerId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(contactService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> create(
            @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(contactService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(contactService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        contactService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{id}/activities")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> activities(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(activityService.findByContact(id)));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CsvImportResult>> importCsv(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok(contactService.importFromCsv(file)));
    }
}
