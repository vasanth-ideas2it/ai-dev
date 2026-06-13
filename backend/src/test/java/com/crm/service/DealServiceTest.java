package com.crm.service;

import com.crm.dto.DealResponse;
import com.crm.entity.*;
import com.crm.mapper.DealMapper;
import com.crm.repository.*;
import com.crm.security.CustomUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DealServiceTest {

    @Mock DealRepository dealRepository;
    @Mock PipelineRepository pipelineRepository;
    @Mock PipelineStageRepository stageRepository;
    @Mock ContactRepository contactRepository;
    @Mock CompanyRepository companyRepository;
    @Mock UserRepository userRepository;
    @Mock ActivityRepository activityRepository;
    @Mock DealMapper dealMapper;
    @InjectMocks DealService dealService;

    private UUID orgId;
    private UUID userId;

    @BeforeEach
    void setUpSecurityContext() {
        orgId  = UUID.randomUUID();
        userId = UUID.randomUUID();
        CustomUserDetails principal = new CustomUserDetails(
                userId, orgId, UserRole.MANAGER, "rep@test.com", null, true);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    // ── moveDeal ──────────────────────────────────────────────────────────────

    @Test
    void moveDeal_updatesStageAndProbabilityAndCreatesActivity() {
        UUID dealId = UUID.randomUUID();
        UUID newStageId = UUID.randomUUID();

        PipelineStage oldStage = buildStage(UUID.randomUUID(), "Qualified", 25);
        PipelineStage newStage = buildStage(newStageId, "Proposal", 50);
        Deal deal = buildDeal(dealId, oldStage);
        User currentUser = buildUser(userId);
        DealResponse mockResponse = stubDealResponse(dealId);

        when(dealRepository.findByIdAndOrgId(dealId, orgId)).thenReturn(Optional.of(deal));
        when(stageRepository.findByIdAndOrgId(newStageId, orgId)).thenReturn(Optional.of(newStage));
        when(userRepository.findById(userId)).thenReturn(Optional.of(currentUser));
        when(dealRepository.save(deal)).thenReturn(deal);
        when(activityRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(dealMapper.entityToResponse(deal)).thenReturn(mockResponse);

        DealResponse result = dealService.moveDeal(dealId, newStageId);

        // Deal stage and probability updated
        assertThat(deal.getStage()).isEqualTo(newStage);
        assertThat(deal.getProbability()).isEqualTo(50);

        // Activity created with correct type and message
        ArgumentCaptor<Activity> actCaptor = ArgumentCaptor.forClass(Activity.class);
        verify(activityRepository).save(actCaptor.capture());
        Activity saved = actCaptor.getValue();
        assertThat(saved.getType()).isEqualTo(ActivityType.STAGE_CHANGED);
        assertThat(saved.getBody()).contains("Qualified").contains("Proposal");
        assertThat(saved.getDeal()).isEqualTo(deal);
        assertThat(saved.getUser()).isEqualTo(currentUser);
        assertThat(saved.getOrgId()).isEqualTo(orgId);

        assertThat(result).isEqualTo(mockResponse);
    }

    @Test
    void moveDeal_sameStage_stillCreatesActivity() {
        UUID dealId = UUID.randomUUID();
        UUID stageId = UUID.randomUUID();

        PipelineStage stage = buildStage(stageId, "Lead", 10);
        Deal deal = buildDeal(dealId, stage);
        User currentUser = buildUser(userId);

        when(dealRepository.findByIdAndOrgId(dealId, orgId)).thenReturn(Optional.of(deal));
        when(stageRepository.findByIdAndOrgId(stageId, orgId)).thenReturn(Optional.of(stage));
        when(userRepository.findById(userId)).thenReturn(Optional.of(currentUser));
        when(dealRepository.save(deal)).thenReturn(deal);
        when(activityRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(dealMapper.entityToResponse(deal)).thenReturn(stubDealResponse(dealId));

        dealService.moveDeal(dealId, stageId);

        verify(activityRepository).save(any(Activity.class));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private PipelineStage buildStage(UUID id, String name, int probability) {
        PipelineStage s = PipelineStage.builder()
                .orgId(orgId).name(name).stageOrder(1).probability(probability).build();
        s.setId(id);
        return s;
    }

    private Deal buildDeal(UUID id, PipelineStage stage) {
        Deal d = Deal.builder()
                .orgId(orgId).title("Test Deal").value(BigDecimal.TEN)
                .currency("USD").stage(stage).probability(stage.getProbability()).build();
        d.setId(id);
        return d;
    }

    private User buildUser(UUID id) {
        User u = User.builder()
                .orgId(orgId).email("rep@test.com").passwordHash("x")
                .firstName("Rep").role(UserRole.REP).active(true).build();
        u.setId(id);
        return u;
    }

    private DealResponse stubDealResponse(UUID id) {
        return new DealResponse(id, orgId, "Test Deal", BigDecimal.TEN, "USD",
                null, null, null, null, null, null, null,
                null, null, null, 50, Instant.now(), Instant.now());
    }
}
