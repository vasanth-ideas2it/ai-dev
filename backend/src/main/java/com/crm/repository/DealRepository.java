package com.crm.repository;

import com.crm.entity.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DealRepository extends JpaRepository<Deal, UUID>, JpaSpecificationExecutor<Deal> {

    Optional<Deal> findByIdAndOrgId(UUID id, UUID orgId);

    long countByStage_IdAndDeletedAtIsNull(UUID stageId);

    // @SQLRestriction on Deal entity auto-excludes deleted_at IS NOT NULL rows
    long countByOrgId(UUID orgId);

    @Query("SELECT COALESCE(SUM(d.value), 0) FROM Deal d WHERE d.orgId = :orgId")
    BigDecimal sumValueByOrgId(@Param("orgId") UUID orgId);

    @Query("""
            SELECT s.id, s.name, COUNT(d), COALESCE(SUM(d.value), 0)
            FROM Deal d JOIN d.stage s JOIN s.pipeline p
            WHERE d.orgId = :orgId AND p.id = :pipelineId
            GROUP BY s.id, s.name, s.stageOrder
            ORDER BY s.stageOrder ASC
            """)
    List<Object[]> dealsByStageRaw(@Param("orgId") UUID orgId, @Param("pipelineId") UUID pipelineId);

    @Query(value = """
            SELECT TO_CHAR(close_date, 'YYYY-MM')   AS month,
                   COALESCE(SUM(value), 0)           AS expected,
                   COALESCE(SUM(value * probability / 100.0), 0) AS weighted
            FROM deals
            WHERE org_id       = :orgId
              AND deleted_at   IS NULL
              AND close_date   IS NOT NULL
              AND close_date  >= :since
              AND close_date   < :until
            GROUP BY TO_CHAR(close_date, 'YYYY-MM')
            ORDER BY month ASC
            """, nativeQuery = true)
    List<Object[]> revenueForecastRaw(@Param("orgId") UUID orgId,
                                      @Param("since") LocalDate since,
                                      @Param("until") LocalDate until);

    @Query("SELECT d FROM Deal d " +
           "JOIN FETCH d.stage s " +
           "JOIN FETCH s.pipeline " +
           "LEFT JOIN FETCH d.owner " +
           "WHERE d.orgId = :orgId AND s.pipeline.id = :pipelineId " +
           "AND d.deletedAt IS NULL " +
           "ORDER BY s.stageOrder ASC, d.createdAt DESC")
    List<Deal> findAllForKanban(@Param("orgId") UUID orgId, @Param("pipelineId") UUID pipelineId);
}
