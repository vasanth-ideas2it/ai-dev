package com.crm.repository;

import com.crm.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Page<Company> findAllByOrgIdAndDeletedAtIsNull(UUID orgId, Pageable pageable);

    Optional<Company> findByIdAndOrgId(UUID id, UUID orgId);

    @Query("""
            SELECT co FROM Company co
            WHERE co.orgId = :orgId
            AND (LOWER(co.name)     LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(co.industry) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Company> searchByOrgId(@Param("orgId") UUID orgId,
                                @Param("q") String query,
                                Pageable pageable);
}
