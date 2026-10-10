package com.cabride.identity.dto;

import java.time.LocalDate;

import com.cabride.identity.entities.RoleType;
import com.cabride.identity.enums.UserGender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserRequestDto(
		@Email @NotBlank String email,
		@NotBlank String firstName,
		@NotBlank String lastName,
		@NotNull UserGender gender,
		String password,
		@NotNull LocalDate dob,
		@NotBlank String phone,
		@NotNull AddressDto address,
		@NotNull RoleType role) {
}
