package com.crm.mapper;

import com.crm.dto.ActivityRequest;
import com.crm.dto.ActivityResponse;
import com.crm.entity.Activity;
import com.crm.entity.User;
import com.crm.security.SecurityUtils;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ActivityMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orgId", ignore = true)
    @Mapping(target = "contact", ignore = true)
    @Mapping(target = "deal", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Activity requestToEntity(ActivityRequest request);

    @AfterMapping
    default void setOrgId(@MappingTarget Activity activity) {
        activity.setOrgId(SecurityUtils.getCurrentOrgId());
    }

    @Mapping(target = "contactId", source = "contact.id")
    @Mapping(target = "dealId", source = "deal.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", expression = "java(fullName(activity.getUser()))")
    ActivityResponse entityToResponse(Activity activity);

    default String fullName(User u) {
        if (u == null) return null;
        return u.getLastName() != null ? u.getFirstName() + " " + u.getLastName() : u.getFirstName();
    }
}
