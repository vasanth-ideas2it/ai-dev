package com.crm.service;

import com.crm.dto.*;
import com.crm.entity.Contact;
import com.crm.entity.UserRole;
import com.crm.exception.ResourceNotFoundException;
import com.crm.mapper.ContactMapper;
import com.crm.repository.CompanyRepository;
import com.crm.repository.ContactRepository;
import com.crm.repository.UserRepository;
import com.crm.security.CustomUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock ContactRepository contactRepository;
    @Mock CompanyRepository companyRepository;
    @Mock UserRepository    userRepository;
    @Mock ContactMapper     contactMapper;
    @InjectMocks ContactService contactService;

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

    // ── findById ─────────────────────────────────────────────────────────────

    @Test
    void findById_existingContact_returnsMappedResponse() {
        UUID id      = UUID.randomUUID();
        Contact c    = stubContact(id);
        ContactResponse resp = stubResponse(id);

        when(contactRepository.findByIdAndOrgId(id, orgId)).thenReturn(Optional.of(c));
        when(contactMapper.entityToResponse(c)).thenReturn(resp);

        assertThat(contactService.findById(id).firstName()).isEqualTo("Alice");
    }

    @Test
    void findById_missingContact_throwsResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        when(contactRepository.findByIdAndOrgId(id, orgId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> contactService.findById(id));
    }

    // ── findAll ──────────────────────────────────────────────────────────────

    @Test
    void findAll_noFilters_queriesWithOrgId() {
        Pageable pageable = PageRequest.of(0, 20);
        when(contactRepository.findAllByOrgIdAndDeletedAtIsNull(orgId, pageable))
                .thenReturn(new PageImpl<>(List.of()));

        PagedResponse<ContactResponse> result = contactService.findAll(pageable, null, null);

        assertThat(result.content()).isEmpty();
        assertThat(result.meta().getTotal()).isZero();
        verify(contactRepository).findAllByOrgIdAndDeletedAtIsNull(orgId, pageable);
    }

    @Test
    void findAll_withSearch_usesSearchQuery() {
        Pageable pageable = PageRequest.of(0, 20);
        when(contactRepository.searchByOrgId(eq(orgId), eq("ali"), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of()));

        contactService.findAll(pageable, "ali", null);

        verify(contactRepository).searchByOrgId(orgId, "ali", pageable);
        verifyNoMoreInteractions(contactRepository);
    }

    @Test
    void findAll_withOwner_usesOwnerQuery() {
        Pageable pageable = PageRequest.of(0, 20);
        UUID ownerId = UUID.randomUUID();
        when(contactRepository.findAllByOrgIdAndDeletedAtIsNullAndOwner_Id(orgId, ownerId, pageable))
                .thenReturn(new PageImpl<>(List.of()));

        contactService.findAll(pageable, null, ownerId);

        verify(contactRepository).findAllByOrgIdAndDeletedAtIsNullAndOwner_Id(orgId, ownerId, pageable);
    }

    // ── create ───────────────────────────────────────────────────────────────

    @Test
    void create_noAssociations_savesAndReturnsResponse() {
        ContactRequest req  = new ContactRequest("Bob", "Smith", null, null, null, null, null);
        Contact        entity = stubContact(UUID.randomUUID());
        ContactResponse resp  = stubResponse(entity.getId());

        when(contactMapper.requestToEntity(req)).thenReturn(entity);
        when(contactRepository.save(entity)).thenReturn(entity);
        when(contactMapper.entityToResponse(entity)).thenReturn(resp);

        assertThat(contactService.create(req).firstName()).isEqualTo("Alice");
        verify(contactRepository).save(entity);
    }

    // ── delete ───────────────────────────────────────────────────────────────

    @Test
    void delete_existingContact_setsDeletedAt() {
        UUID    id = UUID.randomUUID();
        Contact c  = stubContact(id);

        when(contactRepository.findByIdAndOrgId(id, orgId)).thenReturn(Optional.of(c));
        when(contactRepository.save(any())).thenReturn(c);

        contactService.delete(id);

        assertThat(c.getDeletedAt()).isNotNull().isBefore(Instant.now().plusSeconds(1));
        verify(contactRepository).save(c);
    }

    @Test
    void delete_missingContact_throwsResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        when(contactRepository.findByIdAndOrgId(id, orgId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> contactService.delete(id));
        verify(contactRepository, never()).save(any());
    }

    // ── update ───────────────────────────────────────────────────────────────

    @Test
    void update_missingContact_throwsResourceNotFoundException() {
        UUID id  = UUID.randomUUID();
        ContactRequest req = new ContactRequest("X", null, null, null, null, null, null);
        when(contactRepository.findByIdAndOrgId(id, orgId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> contactService.update(id, req));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Contact stubContact(UUID id) {
        Contact c = Contact.builder().orgId(orgId).firstName("Alice").build();
        c.setId(id);
        return c;
    }

    private ContactResponse stubResponse(UUID id) {
        return new ContactResponse(id, orgId, "Alice", null, null, null, null,
                null, null, null, null, Instant.now(), Instant.now());
    }
}
