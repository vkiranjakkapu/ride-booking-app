package com.cabride.identity.dto;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequestDto(@NotBlank String refreshToken) {
}
