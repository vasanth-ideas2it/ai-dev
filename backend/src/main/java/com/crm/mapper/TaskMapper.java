package com.crm.mapper;

import com.crm.dto.TaskRequest;
import com.crm.dto.TaskResponse;
import com.crm.entity.Task;
import com.crm.entity.User;
import com.crm.security.SecurityUtils;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orgId", ignore = true)
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "contact", ignore = true)
    @Mapping(target = "deal", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Task requestToEntity(TaskRequest request);

    @AfterMapping
    default void setOrgId(@MappingTarget Task task) {
        task.setOrgId(SecurityUtils.getCurrentOrgId());
    }

    @Mapping(target = "assigneeId", source = "assignee.id")
    @Mapping(target = "assigneeName", expression = "java(fullName(task.getAssignee()))")
    @Mapping(target = "contactId", source = "contact.id")
    @Mapping(target = "dealId", source = "deal.id")
    TaskResponse entityToResponse(Task task);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orgId", ignore = true)
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "contact", ignore = true)
    @Mapping(target = "deal", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(TaskRequest request, @MappingTarget Task task);

    default String fullName(User u) {
        if (u == null) return null;
        return u.getLastName() != null ? u.getFirstName() + " " + u.getLastName() : u.getFirstName();
    }
}
