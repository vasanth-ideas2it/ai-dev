package com.crm.service;

import com.crm.dto.*;
import com.crm.entity.Task;
import com.crm.entity.TaskStatus;
import com.crm.exception.ResourceNotFoundException;
import com.crm.mapper.TaskMapper;
import com.crm.repository.*;
import com.crm.security.SecurityUtils;
import com.crm.specification.TaskSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final DealRepository dealRepository;
    private final TaskMapper taskMapper;

    @Transactional(readOnly = true)
    public TaskResponse findById(UUID id) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Task task = taskRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        return taskMapper.entityToResponse(task);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> findAllFiltered(
            Pageable pageable, TaskStatus status, UUID assigneeId,
            Instant dueDate, UUID contactId, UUID dealId) {
        UUID orgId = SecurityUtils.getCurrentOrgId();

        Specification<Task> spec = Specification.where(TaskSpecifications.forOrg(orgId));
        if (status     != null) spec = spec.and(TaskSpecifications.hasStatus(status));
        if (assigneeId != null) spec = spec.and(TaskSpecifications.assignedTo(assigneeId));
        if (dueDate    != null) spec = spec.and(TaskSpecifications.dueBefore(dueDate));
        if (contactId  != null) spec = spec.and(TaskSpecifications.forContact(contactId));
        if (dealId     != null) spec = spec.and(TaskSpecifications.forDeal(dealId));

        Page<Task> page = taskRepository.findAll(spec, pageable);
        List<TaskResponse> content = page.getContent().stream()
                .map(taskMapper::entityToResponse)
                .toList();
        return new PagedResponse<>(content, PageMeta.of(
                pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements()));
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Task task = taskMapper.requestToEntity(request);
        task.setStatus(TaskStatus.TODO);
        resolveAssociations(task, request, orgId);
        return taskMapper.entityToResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(UUID id, TaskRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Task task = taskRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        taskMapper.updateFromRequest(request, task);
        resolveAssociations(task, request, orgId);
        return taskMapper.entityToResponse(taskRepository.save(task));
    }

    @Transactional
    public void delete(UUID id) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Task task = taskRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse complete(UUID id) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        Task task = taskRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        task.setStatus(TaskStatus.DONE);
        return taskMapper.entityToResponse(taskRepository.save(task));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void resolveAssociations(Task task, TaskRequest request, UUID orgId) {
        if (request.assigneeId() != null) {
            task.setAssignee(userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.assigneeId())));
        } else {
            task.setAssignee(null);
        }

        if (request.contactId() != null) {
            task.setContact(contactRepository.findByIdAndOrgId(request.contactId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + request.contactId())));
        } else {
            task.setContact(null);
        }

        if (request.dealId() != null) {
            task.setDeal(dealRepository.findByIdAndOrgId(request.dealId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deal not found: " + request.dealId())));
        } else {
            task.setDeal(null);
        }
    }
}
