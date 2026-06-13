package com.crm.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
public class PurgeService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void purgeOldSoftDeleted() {
        Instant cutoff = Instant.now().minus(90, ChronoUnit.DAYS);

        // Native queries bypass @SQLRestriction so deleted rows are visible
        int contacts = entityManager.createNativeQuery(
                "DELETE FROM contacts WHERE deleted_at IS NOT NULL AND deleted_at < :cutoff")
                .setParameter("cutoff", cutoff)
                .executeUpdate();

        int deals = entityManager.createNativeQuery(
                "DELETE FROM deals WHERE deleted_at IS NOT NULL AND deleted_at < :cutoff")
                .setParameter("cutoff", cutoff)
                .executeUpdate();

        int companies = entityManager.createNativeQuery(
                "DELETE FROM companies WHERE deleted_at IS NOT NULL AND deleted_at < :cutoff")
                .setParameter("cutoff", cutoff)
                .executeUpdate();

        log.info("Purge complete — contacts={}, deals={}, companies={}", contacts, deals, companies);
    }
}
