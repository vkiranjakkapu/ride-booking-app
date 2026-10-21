package com.cabride.bookings.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import com.cabride.bookings.enums.RoleType;
import com.cabride.bookings.enums.UserGender;

import lombok.Builder;

@Builder
public record UserResponseDto(UUID id,
		String email,
		String firstName,
		String lastName,
		String vehicleNumber,
		String phone,
		LocalDate dob,
		UserGender gender,
		AddressDto address,
		boolean enabled,
		Set<RoleType> roles,
		LocalDateTime createdAt,
		LocalDateTime updatedAt) {
}