package com.crm.dto;

import java.util.List;

public record PagedResponse<T>(List<T> content, PageMeta meta) {}
