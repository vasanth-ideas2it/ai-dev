package com.crm.mapper;

import com.crm.dto.CompanyRequest;
import com.crm.dto.CompanyResponse;
import com.crm.dto.CompanySummaryResponse;
import com.crm.entity.Company;
import com.crm.security.SecurityUtils;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "orgId",     ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "contacts",  ignore = true)
    Company requestToEntity(CompanyRequest request);

    @AfterMapping
    default void setOrgId(@MappingTarget Company company) {
        company.setOrgId(SecurityUtils.getCurrentOrgId());
    }

    CompanyResponse entityToResponse(Company company);

    CompanySummaryResponse entityToSummary(Company company);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "orgId",     ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "contacts",  ignore = true)
    void updateFromRequest(CompanyRequest request, @MappingTarget Company company);
}
