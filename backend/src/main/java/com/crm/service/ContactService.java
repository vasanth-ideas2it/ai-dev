package com.crm.service;

import com.crm.dto.*;
import com.crm.entity.Company;
import com.crm.entity.Contact;
import com.crm.entity.User;
import com.crm.exception.ResourceNotFoundException;
import com.crm.mapper.ContactMapper;
import com.crm.repository.CompanyRepository;
import com.crm.repository.ContactRepository;
import com.crm.repository.UserRepository;
import com.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final ContactMapper contactMapper;

    @Transactional(readOnly = true)
    public ContactResponse findById(UUID id) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Contact contact = contactRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + id));
        return contactMapper.entityToResponse(contact);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ContactResponse> findAll(Pageable pageable, String search, UUID ownerId) {
        UUID orgId = SecurityUtils.getCurrentOrgId();

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasOwner  = ownerId != null;

        Page<Contact> page;
        if (hasSearch && hasOwner) {
            page = contactRepository.searchByOrgIdAndOwnerId(orgId, ownerId, search, pageable);
        } else if (hasSearch) {
            page = contactRepository.searchByOrgId(orgId, search, pageable);
        } else if (hasOwner) {
            page = contactRepository.findAllByOrgIdAndDeletedAtIsNullAndOwner_Id(orgId, ownerId, pageable);
        } else {
            page = contactRepository.findAllByOrgIdAndDeletedAtIsNull(orgId, pageable);
        }

        List<ContactResponse> content = page.getContent().stream()
                .map(contactMapper::entityToResponse)
                .toList();
        return new PagedResponse<>(content, PageMeta.of(
                pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements()));
    }

    @Transactional(readOnly = true)
    public PagedResponse<ContactSummaryResponse> search(String query, Pageable pageable) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Page<Contact> page = contactRepository.searchByOrgId(orgId, query, pageable);
        List<ContactSummaryResponse> content = page.getContent().stream()
                .map(contactMapper::entityToSummary)
                .toList();
        return new PagedResponse<>(content, PageMeta.of(
                pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements()));
    }

    @Transactional
    public ContactResponse create(ContactRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Contact contact = contactMapper.requestToEntity(request); // @AfterMapping sets orgId
        resolveAssociations(contact, request, orgId);
        return contactMapper.entityToResponse(contactRepository.save(contact));
    }

    @Transactional
    public ContactResponse update(UUID id, ContactRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Contact contact = contactRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + id));
        contactMapper.updateFromRequest(request, contact);
        resolveAssociations(contact, request, orgId);
        return contactMapper.entityToResponse(contactRepository.save(contact));
    }

    @Transactional
    public void delete(UUID id) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Contact contact = contactRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + id));
        contact.setDeletedAt(Instant.now());
        contactRepository.save(contact);
    }

    @Transactional
    public CsvImportResult importFromCsv(MultipartFile file) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        List<String> errors = new ArrayList<>();
        int rowNum = 0;
        int imported = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String header = reader.readLine();
            if (header == null) {
                return new CsvImportResult(0, 0, 0, List.of("File is empty"));
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                rowNum++;
                try {
                    String[] f = parseLine(line);
                    String firstName = cell(f, 0);
                    if (firstName.isBlank()) {
                        errors.add("Row " + rowNum + ": firstName is required");
                        continue;
                    }
                    Contact contact = Contact.builder()
                            .orgId(orgId)
                            .firstName(firstName)
                            .lastName(cell(f, 1))
                            .email(cell(f, 2))
                            .phone(cell(f, 3))
                            .notes(cell(f, 4))
                            .build();
                    contactRepository.save(contact);
                    imported++;
                } catch (Exception e) {
                    errors.add("Row " + rowNum + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Cannot read CSV file: " + e.getMessage());
        }

        return new CsvImportResult(rowNum, imported, errors.size(), errors);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void resolveAssociations(Contact contact, ContactRequest request, UUID orgId) {
        if (request.companyId() != null) {
            Company company = companyRepository.findByIdAndOrgId(request.companyId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Company not found: " + request.companyId()));
            contact.setCompany(company);
        } else {
            contact.setCompany(null);
        }

        if (request.ownerId() != null) {
            User owner = userRepository.findByIdAndOrgId(request.ownerId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User not found: " + request.ownerId()));
            contact.setOwner(owner);
        } else {
            contact.setOwner(null);
        }
    }

    // Splits a CSV line respecting double-quoted fields.
    private String[] parseLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                // doubled quote inside quoted field → literal quote
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    sb.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                fields.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        fields.add(sb.toString().trim());
        return fields.toArray(String[]::new);
    }

    private String cell(String[] fields, int idx) {
        if (idx >= fields.length) return "";
        String v = fields[idx];
        return v == null ? "" : v.trim();
    }
}
