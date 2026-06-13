package com.crm.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PageMeta {

    private final int page;
    private final int size;
    private final long total;
    private final int totalPages;

    public static PageMeta of(int page, int size, long total) {
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) total / size);
        return PageMeta.builder()
                .page(page)
                .size(size)
                .total(total)
                .totalPages(totalPages)
                .build();
    }
}
