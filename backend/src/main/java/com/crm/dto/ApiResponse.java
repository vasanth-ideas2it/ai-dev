package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final T data;
    private final ErrorPayload error;
    private final PageMeta meta;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder().data(data).build();
    }

    public static <T> ApiResponse<T> ok(T data, PageMeta meta) {
        return ApiResponse.<T>builder().data(data).meta(meta).build();
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .error(ErrorPayload.builder().code(code).message(message).build())
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorPayload errorPayload) {
        return ApiResponse.<T>builder().error(errorPayload).build();
    }
}
