package com.crm.dto;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        long newContactsThisMonth,
        long openDeals,
        BigDecimal totalDealValue,
        long overdueTasksCount
) {}
