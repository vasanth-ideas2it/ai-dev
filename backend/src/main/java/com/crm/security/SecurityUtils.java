package com.crm.security;

import com.crm.entity.UserRole;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static CustomUserDetails getCurrentUser() {
        return (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    }

    public static UUID getCurrentUserId() {
        return getCurrentUser().getUserId();
    }

    public static UUID getCurrentOrgId() {
        return getCurrentUser().getOrgId();
    }

    public static UserRole getCurrentRole() {
        return getCurrentUser().getRole();
    }
}
