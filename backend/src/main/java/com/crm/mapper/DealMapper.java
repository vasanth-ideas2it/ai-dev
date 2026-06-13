package com.crm.mapper;

import com.crm.dto.DealRequest;
import com.crm.dto.DealResponse;
import com.crm.dto.DealSummary;
import com.crm.entity.Deal;
import com.crm.entity.User;
import com.crm.security.SecurityUtils;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface DealMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orgId", ignore = true)
    @Mapping(target = "stage", ignore = true)
    @Mapping(target = "contact", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "probability", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "tasks", ignore = true)
    Deal requestToEntity(DealRequest request);

    @AfterMapping
    default void setOrgId(@MappingTarget Deal deal) {
        deal.setOrgId(SecurityUtils.getCurrentOrgId());
    }

    @Mapping(target = "stageId", source = "stage.id")
    @Mapping(target = "stageName", source = "stage.name")
    @Mapping(target = "pipelineId", source = "stage.pipeline.id")
    @Mapping(target = "contactId", source = "contact.id")
    @Mapping(target = "contactName", expression = "java(fullContactName(deal))")
    @Mapping(target = "companyId", source = "company.id")
    @Mapping(target = "companyName", source = "company.name")
    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "ownerName", expression = "java(fullName(deal.getOwner()))")
    DealResponse entityToResponse(Deal deal);

    @Mapping(target = "stageId", source = "stage.id")
    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "ownerName", expression = "java(fullName(deal.getOwner()))")
    DealSummary entityToSummary(Deal deal);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orgId", ignore = true)
    @Mapping(target = "stage", ignore = true)
    @Mapping(target = "contact", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "probability", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "tasks", ignore = true)
    void updateFromRequest(DealRequest request, @MappingTarget Deal deal);

    default String fullName(User u) {
        if (u == null) return null;
        return u.getLastName() != null ? u.getFirstName() + " " + u.getLastName() : u.getFirstName();
    }

    default String fullContactName(Deal deal) {
        var c = deal.getContact();
        if (c == null) return null;
        return c.getLastName() != null ? c.getFirstName() + " " + c.getLastName() : c.getFirstName();
    }
}
