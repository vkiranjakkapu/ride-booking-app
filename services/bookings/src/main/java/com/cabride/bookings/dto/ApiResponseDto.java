package com.cabride.bookings.dto;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record ApiResponseDto<T>(T data, LocalDateTime timestamp) {
    public ApiResponseDto {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
