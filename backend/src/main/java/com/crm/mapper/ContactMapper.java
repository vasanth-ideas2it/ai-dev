package com.crm.mapper;

import com.crm.dto.ContactRequest;
import com.crm.dto.ContactResponse;
import com.crm.dto.ContactSummaryResponse;
import com.crm.entity.Contact;
import com.crm.security.SecurityUtils;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ContactMapper {

    @Mapping(target = "id",         ignore = true)
    @Mapping(target = "orgId",      ignore = true) // set in @AfterMapping
    @Mapping(target = "createdAt",  ignore = true)
    @Mapping(target = "updatedAt",  ignore = true)
    @Mapping(target = "deletedAt",  ignore = true)
    @Mapping(target = "company",    ignore = true) // resolved by service from companyId
    @Mapping(target = "owner",      ignore = true) // resolved by service from ownerId
    @Mapping(target = "tags",       ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "tasks",      ignore = true)
    Contact requestToEntity(ContactRequest request);

    // orgId must come from the SecurityContext, never from user-supplied input.
    @AfterMapping
    default void setOrgId(@MappingTarget Contact contact) {
        contact.setOrgId(SecurityUtils.getCurrentOrgId());
    }

    @Mapping(target = "companyId",   source = "company.id")
    @Mapping(target = "companyName", source = "company.name")
    @Mapping(target = "ownerId",     source = "owner.id")
    @Mapping(target = "ownerName",
             expression = "java(contact.getOwner() == null ? null : " +
                          "contact.getOwner().getFirstName() + " +
                          "(contact.getOwner().getLastName() != null ? ' ' + contact.getOwner().getLastName() : \"\"))")
    ContactResponse entityToResponse(Contact contact);

    @Mapping(target = "fullName",
             expression = "java(contact.getFirstName() + " +
                          "(contact.getLastName() != null ? ' ' + contact.getLastName() : \"\"))")
    ContactSummaryResponse entityToSummary(Contact contact);

    // For PUT: replaces scalar fields; company/owner resolved in service.
    @Mapping(target = "id",         ignore = true)
    @Mapping(target = "orgId",      ignore = true)
    @Mapping(target = "createdAt",  ignore = true)
    @Mapping(target = "updatedAt",  ignore = true)
    @Mapping(target = "deletedAt",  ignore = true)
    @Mapping(target = "company",    ignore = true)
    @Mapping(target = "owner",      ignore = true)
    @Mapping(target = "tags",       ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "tasks",      ignore = true)
    void updateFromRequest(ContactRequest request, @MappingTarget Contact contact);
}
