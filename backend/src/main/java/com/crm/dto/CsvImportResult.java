package com.crm.dto;

import java.util.List;

public record CsvImportResult(int total, int imported, int failed, List<String> errors) {}
