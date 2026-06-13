package com.crm.repository;

import com.crm.entity.Task;
import com.crm.entity.TaskStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {

    Optional<Task> findByIdAndOrgId(UUID id, UUID orgId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.orgId = :orgId AND t.status <> :done AND t.dueDate < :now")
    long countOverdue(@Param("orgId") UUID orgId,
                      @Param("done") TaskStatus done,
                      @Param("now") Instant now);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assignee WHERE t.orgId = :orgId AND t.status <> :done AND t.dueDate < :now ORDER BY t.dueDate ASC")
    List<Task> findOverdue(@Param("orgId") UUID orgId,
                           @Param("done") TaskStatus done,
                           @Param("now") Instant now,
                           Pageable pageable);
}
