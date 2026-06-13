package com.crm.repository;

import com.crm.entity.Activity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    List<Activity> findAllByOrgIdAndContact_IdOrderByCreatedAtDesc(UUID orgId, UUID contactId);

    List<Activity> findAllByOrgIdAndDeal_IdOrderByCreatedAtDesc(UUID orgId, UUID dealId);

    @Query("SELECT a FROM Activity a JOIN FETCH a.user WHERE a.orgId = :orgId ORDER BY a.createdAt DESC")
    List<Activity> findRecentByOrgId(@Param("orgId") UUID orgId, Pageable pageable);
}
