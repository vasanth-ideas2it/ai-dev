package com.crm.repository;

import com.crm.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface ContactRepository extends JpaRepository<Contact, UUID> {

    // @SQLRestriction("deleted_at IS NULL") on the entity makes the deletedAt condition
    // redundant at the SQL level, but we keep it explicit for intent clarity.
    Page<Contact> findAllByOrgIdAndDeletedAtIsNull(UUID orgId, Pageable pageable);

    Page<Contact> findAllByOrgIdAndDeletedAtIsNullAndOwner_Id(UUID orgId, UUID ownerId, Pageable pageable);

    Optional<Contact> findByIdAndOrgId(UUID id, UUID orgId);

    @Query("""
            SELECT c FROM Contact c
            WHERE c.orgId = :orgId
            AND (LOWER(c.firstName) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(c.lastName)  LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(c.email)     LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Contact> searchByOrgId(@Param("orgId") UUID orgId,
                                @Param("q") String query,
                                Pageable pageable);

    @Query("SELECT COUNT(c) FROM Contact c WHERE c.orgId = :orgId AND c.createdAt >= :since")
    long countNewSince(@Param("orgId") UUID orgId, @Param("since") Instant since);

    @Query("""
            SELECT c FROM Contact c
            WHERE c.orgId = :orgId
            AND c.owner.id = :ownerId
            AND (LOWER(c.firstName) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(c.lastName)  LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(c.email)     LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Contact> searchByOrgIdAndOwnerId(@Param("orgId") UUID orgId,
                                          @Param("ownerId") UUID ownerId,
                                          @Param("q") String query,
                                          Pageable pageable);
}
