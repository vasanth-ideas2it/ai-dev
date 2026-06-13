package com.crm.service;

import com.crm.dto.*;
import com.crm.entity.Pipeline;
import com.crm.entity.PipelineStage;
import com.crm.exception.ConflictException;
import com.crm.exception.ResourceNotFoundException;
import com.crm.mapper.PipelineMapper;
import com.crm.repository.DealRepository;
import com.crm.repository.PipelineRepository;
import com.crm.repository.PipelineStageRepository;
import com.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PipelineService {

    private final PipelineRepository pipelineRepository;
    private final PipelineStageRepository stageRepository;
    private final DealRepository dealRepository;
    private final PipelineMapper pipelineMapper;

    @Transactional(readOnly = true)
    public List<PipelineResponse> findAll() {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return pipelineRepository.findAllByOrgId(orgId).stream()
                .map(pipelineMapper::entityToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PipelineResponse findById(UUID id) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Pipeline pipeline = pipelineRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found: " + id));
        return pipelineMapper.entityToResponse(pipeline);
    }

    @Transactional
    public PipelineResponse create(PipelineRequest request) {
        Pipeline pipeline = pipelineMapper.requestToEntity(request);
        pipeline = pipelineRepository.save(pipeline);

        if (request.stages() != null) {
            List<PipelineStage> stages = buildStages(request.stages(), pipeline);
            stageRepository.saveAll(stages);
            pipeline.getStages().addAll(stages);
        }

        return pipelineMapper.entityToResponse(pipeline);
    }

    @Transactional
    public PipelineResponse replaceStages(UUID pipelineId, PipelineStagesRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Pipeline pipeline = pipelineRepository.findByIdAndOrgId(pipelineId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found: " + pipelineId));

        List<PipelineStage> existing = stageRepository.findAllByPipeline_IdOrderByStageOrderAsc(pipelineId);
        Set<UUID> incomingIds = request.stages().stream()
                .filter(s -> s.id() != null)
                .map(PipelineStageRequest::id)
                .collect(Collectors.toSet());

        // Guard: reject if any stage being removed still has active deals
        for (PipelineStage stage : existing) {
            if (!incomingIds.contains(stage.getId())) {
                long dealCount = dealRepository.countByStage_IdAndDeletedAtIsNull(stage.getId());
                if (dealCount > 0) {
                    throw new ConflictException(
                            "Stage '" + stage.getName() + "' still has " + dealCount + " open deal(s)");
                }
            }
        }

        Map<UUID, PipelineStage> existingById = existing.stream()
                .collect(Collectors.toMap(PipelineStage::getId, s -> s));

        List<PipelineStage> toSave = new ArrayList<>();
        for (PipelineStageRequest req : request.stages()) {
            if (req.id() != null && existingById.containsKey(req.id())) {
                PipelineStage stage = existingById.get(req.id());
                stage.setName(req.name());
                stage.setStageOrder(req.stageOrder());
                stage.setProbability(req.probability());
                stage.setColor(req.color());
                toSave.add(stage);
                existingById.remove(req.id());
            } else {
                PipelineStage stage = pipelineMapper.stageRequestToEntity(req);
                stage.setOrgId(orgId);
                stage.setPipeline(pipeline);
                toSave.add(stage);
            }
        }

        // Delete stages not in incoming list (already guarded above)
        if (!existingById.isEmpty()) {
            stageRepository.deleteAll(existingById.values());
        }
        stageRepository.saveAll(toSave);

        return pipelineMapper.entityToResponse(pipelineRepository.findByIdAndOrgId(pipelineId, orgId).orElseThrow());
    }

    @Transactional
    public void createDefaultForOrg(UUID orgId) {
        Pipeline pipeline = Pipeline.builder()
                .orgId(orgId)
                .name("Sales Pipeline")
                .stages(new ArrayList<>())
                .build();
        pipeline = pipelineRepository.save(pipeline);

        record StageSeed(String name, int order, int prob, String color) {}
        List<StageSeed> seeds = List.of(
                new StageSeed("Lead",        1, 10,  "#9E9E9E"),
                new StageSeed("Qualified",   2, 25,  "#2196F3"),
                new StageSeed("Proposal",    3, 50,  "#FF9800"),
                new StageSeed("Negotiation", 4, 75,  "#9C27B0"),
                new StageSeed("Closed Won",  5, 100, "#4CAF50"),
                new StageSeed("Closed Lost", 6, 0,   "#F44336")
        );

        final Pipeline savedPipeline = pipeline;
        List<PipelineStage> stages = seeds.stream().map(s ->
                PipelineStage.builder()
                        .orgId(orgId)
                        .pipeline(savedPipeline)
                        .name(s.name())
                        .stageOrder(s.order())
                        .probability(s.prob())
                        .color(s.color())
                        .build()
        ).toList();
        stageRepository.saveAll(stages);
    }

    private List<PipelineStage> buildStages(List<PipelineStageRequest> requests, Pipeline pipeline) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return requests.stream().map(req -> {
            PipelineStage stage = pipelineMapper.stageRequestToEntity(req);
            stage.setOrgId(orgId);
            stage.setPipeline(pipeline);
            return stage;
        }).toList();
    }
}
