package com.crm.service;

import com.crm.dto.ActivityRequest;
import com.crm.dto.ActivityResponse;
import com.crm.entity.Activity;
import com.crm.entity.User;
import com.crm.exception.ResourceNotFoundException;
import com.crm.mapper.ActivityMapper;
import com.crm.repository.ActivityRepository;
import com.crm.repository.ContactRepository;
import com.crm.repository.DealRepository;
import com.crm.repository.UserRepository;
import com.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ContactRepository contactRepository;
    private final DealRepository dealRepository;
    private final UserRepository userRepository;
    private final ActivityMapper activityMapper;

    @Transactional
    public ActivityResponse create(ActivityRequest request) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        UUID userId = SecurityUtils.getCurrentUserId();

        Activity activity = activityMapper.requestToEntity(request);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        activity.setUser(user);

        if (request.contactId() != null) {
            activity.setContact(contactRepository.findByIdAndOrgId(request.contactId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact not found: " + request.contactId())));
        }

        if (request.dealId() != null) {
            activity.setDeal(dealRepository.findByIdAndOrgId(request.dealId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deal not found: " + request.dealId())));
        }

        return activityMapper.entityToResponse(activityRepository.save(activity));
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> findByContact(UUID contactId) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return activityRepository.findAllByOrgIdAndContact_IdOrderByCreatedAtDesc(orgId, contactId)
                .stream().map(activityMapper::entityToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> findByDeal(UUID dealId) {
        UUID orgId = SecurityUtils.getCurrentOrgId();
        return activityRepository.findAllByOrgIdAndDeal_IdOrderByCreatedAtDesc(orgId, dealId)
                .stream().map(activityMapper::entityToResponse).toList();
    }
}
