package com.crm.specification;

import com.crm.entity.Task;
import com.crm.entity.TaskStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.UUID;

public final class TaskSpecifications {

    private TaskSpecifications() {}

    public static Specification<Task> forOrg(UUID orgId) {
        return (root, query, cb) -> cb.equal(root.get("orgId"), orgId);
    }

    public static Specification<Task> hasStatus(TaskStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Task> assignedTo(UUID assigneeId) {
        return (root, query, cb) -> cb.equal(root.get("assignee").get("id"), assigneeId);
    }

    public static Specification<Task> forContact(UUID contactId) {
        return (root, query, cb) -> cb.equal(root.get("contact").get("id"), contactId);
    }

    public static Specification<Task> forDeal(UUID dealId) {
        return (root, query, cb) -> cb.equal(root.get("deal").get("id"), dealId);
    }

    public static Specification<Task> dueBefore(Instant instant) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("dueDate"), instant);
    }
}
