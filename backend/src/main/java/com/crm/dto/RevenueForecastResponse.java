package com.crm.dto;

import java.math.BigDecimal;

public record RevenueForecastResponse(
        String month,        // "YYYY-MM"
        BigDecimal expected, // sum of deal values closing that month
        BigDecimal weighted  // sum of (value * probability / 100)
) {}
