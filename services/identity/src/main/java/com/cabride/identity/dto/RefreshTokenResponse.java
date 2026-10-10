package com.cabride.identity.dto;

public record RefreshTokenResponse(
		String accessToken,
		String refreshToken) {
}
