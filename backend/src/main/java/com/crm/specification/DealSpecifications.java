package com.crm.specification;

import com.crm.entity.Deal;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class DealSpecifications {

    private DealSpecifications() {}

    public static Specification<Deal> forOrg(UUID orgId) {
        return (root, query, cb) -> cb.equal(root.get("orgId"), orgId);
    }

    public static Specification<Deal> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<Deal> inPipeline(UUID pipelineId) {
        return (root, query, cb) -> {
            var stage = root.join("stage", JoinType.INNER);
            return cb.equal(stage.get("pipeline").get("id"), pipelineId);
        };
    }

    public static Specification<Deal> inStage(UUID stageId) {
        return (root, query, cb) -> cb.equal(root.get("stage").get("id"), stageId);
    }

    public static Specification<Deal> ownedBy(UUID ownerId) {
        return (root, query, cb) -> cb.equal(root.get("owner").get("id"), ownerId);
    }
}
