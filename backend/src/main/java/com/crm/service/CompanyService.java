package com.crm.service;

import com.crm.dto.*;
import com.crm.entity.Company;
import com.crm.exception.ResourceNotFoundException;
import com.crm.mapper.CompanyMapper;
import com.crm.repository.CompanyRepository;
import com.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    @Transactional(readOnly = true)
    public CompanyResponse findById(UUID id) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Company company = companyRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        return companyMapper.entityToResponse(company);
    }

    @Transactional(readOnly = true)
    public PagedResponse<CompanyResponse> findAll(Pageable pageable, String search) {
        UUID orgId = SecurityUtils.getCurrentOrgId();

        Page<Company> page = (search != null && !search.isBlank())
                ? companyRepository.searchByOrgId(orgId, search, pageable)
                : companyRepository.findAllByOrgIdAndDeletedAtIsNull(orgId, pageable);

        List<CompanyResponse> content = page.getContent().stream()
                .map(companyMapper::entityToResponse)
                .toList();
        return new PagedResponse<>(content, PageMeta.of(
                pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements()));
    }

    @Transactional(readOnly = true)
    public PagedResponse<CompanySummaryResponse> search(String query, Pageable pageable) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Page<Company> page = companyRepository.searchByOrgId(orgId, query, pageable);
        List<CompanySummaryResponse> content = page.getContent().stream()
                .map(companyMapper::entityToSummary)
                .toList();
        return new PagedResponse<>(content, PageMeta.of(
                pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements()));
    }

    @Transactional
    public CompanyResponse create(CompanyRequest request) {
        Company company = companyMapper.requestToEntity(request); // @AfterMapping sets orgId
        return companyMapper.entityToResponse(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse update(UUID id, CompanyRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Company company = companyRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        companyMapper.updateFromRequest(request, company);
        return companyMapper.entityToResponse(companyRepository.save(company));
    }

    @Transactional
    public void delete(UUID id) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Company company = companyRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        company.setDeletedAt(Instant.now());
        companyRepository.save(company);
    }
}
