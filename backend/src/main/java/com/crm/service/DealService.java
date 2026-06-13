package com.crm.service;

import com.crm.dto.*;
import com.crm.entity.*;
import com.crm.exception.ResourceNotFoundException;
import com.crm.mapper.DealMapper;
import com.crm.repository.*;
import com.crm.security.SecurityUtils;
import com.crm.specification.DealSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;
    private final PipelineRepository pipelineRepository;
    private final PipelineStageRepository stageRepository;
    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final DealMapper dealMapper;

    @Transactional(readOnly = true)
    public DealResponse findById(UUID id) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Deal deal = dealRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found: " + id));
        return dealMapper.entityToResponse(deal);
    }

    @Transactional(readOnly = true)
    public PagedResponse<DealResponse> findAllFiltered(
            Pageable pageable, UUID pipelineId, UUID stageId, UUID ownerId) {
        UUID orgId = SecurityUtils.getCurrentOrgId();

        Specification<Deal> spec = Specification
                .where(DealSpecifications.forOrg(orgId))
                .and(DealSpecifications.notDeleted());

        if (pipelineId != null) spec = spec.and(DealSpecifications.inPipeline(pipelineId));
        if (stageId   != null) spec = spec.and(DealSpecifications.inStage(stageId));
        if (ownerId   != null) spec = spec.and(DealSpecifications.ownedBy(ownerId));

        Page<Deal> page = dealRepository.findAll(spec, pageable);
        List<DealResponse> content = page.getContent().stream()
                .map(dealMapper::entityToResponse)
                .toList();
        return new PagedResponse<>(content, PageMeta.of(
                pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements()));
    }

    @Transactional(readOnly = true)
    public KanbanBoard kanbanBoard(UUID pipelineId) {
        UUID orgId = SecurityUtils.getCurrentOrgId();

        Pipeline pipeline = pipelineRepository.findByIdAndOrgId(pipelineId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found: " + pipelineId));

        List<Deal> deals = dealRepository.findAllForKanban(orgId, pipelineId);

        Map<UUID, List<Deal>> byStage = deals.stream()
                .collect(Collectors.groupingBy(d -> d.getStage().getId(), LinkedHashMap::new, Collectors.toList()));

        List<KanbanColumn> columns = pipeline.getStages().stream()
                .sorted(Comparator.comparingInt(PipelineStage::getStageOrder))
                .map(stage -> new KanbanColumn(
                        stage.getId(),
                        stage.getName(),
                        stage.getStageOrder(),
                        stage.getProbability(),
                        stage.getColor(),
                        byStage.getOrDefault(stage.getId(), List.of()).stream()
                                .map(dealMapper::entityToSummary)
                                .toList()
                ))
                .toList();

        return new KanbanBoard(pipeline.getId(), pipeline.getName(), columns);
    }

    @Transactional
    public DealResponse create(DealRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Deal deal = dealMapper.requestToEntity(request);
        resolveAssociations(deal, request, orgId);
        deal = dealRepository.save(deal);
        return dealMapper.entityToResponse(deal);
    }

    @Transactional
    public DealResponse update(UUID id, DealRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Deal deal = dealRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found: " + id));
        dealMapper.updateFromRequest(request, deal);
        resolveAssociations(deal, request, orgId);
        return dealMapper.entityToResponse(dealRepository.save(deal));
    }

    @Transactional
    public void delete(UUID id) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Deal deal = dealRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found: " + id));
        deal.setDeletedAt(Instant.now());
        dealRepository.save(deal);
    }

    @Transactional
    public DealResponse moveDeal(UUID dealId, UUID newStageId) {
        UUID orgId = SecurityUtils.getCurrentOrgId();

        Deal deal = dealRepository.findByIdAndOrgId(dealId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found: " + dealId));

        PipelineStage newStage = stageRepository.findByIdAndOrgId(newStageId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Stage not found: " + newStageId));

        String oldStageName = deal.getStage().getName();
        deal.setStage(newStage);
        deal.setProbability(newStage.getProbability());
        dealRepository.save(deal);

        UUID userId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Activity activity = Activity.builder()
                .orgId(orgId)
                .type(ActivityType.STAGE_CHANGED)
                .body("Stage changed from '" + oldStageName + "' to '" + newStage.getName() + "'")
                .deal(deal)
                .user(currentUser)
                .build();
        activityRepository.save(activity);

        return dealMapper.entityToResponse(deal);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void resolveAssociations(Deal deal, DealRequest request, UUID orgId) {
        PipelineStage stage = stageRepository.findByIdAndOrgId(request.stageId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Stage not found: " + request.stageId()));
        deal.setStage(stage);
        deal.setProbability(stage.getProbability());

        UUID ownerId = request.ownerId() != null ? request.ownerId() : SecurityUtils.getCurrentUserId();
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + ownerId));
        deal.setOwner(owner);

        if (request.contactId() != null) {
            deal.setContact(contactRepository.findByIdAndOrgId(request.contactId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + request.contactId())));
        } else {
            deal.setContact(null);
        }

        if (request.companyId() != null) {
            deal.setCompany(companyRepository.findByIdAndOrgId(request.companyId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + request.companyId())));
        } else {
            deal.setCompany(null);
        }
    }
}
