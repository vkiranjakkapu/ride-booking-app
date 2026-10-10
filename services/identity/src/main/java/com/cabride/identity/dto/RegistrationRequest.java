package com.cabride.identity.dto;

import com.cabride.identity.entities.RoleType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record RegistrationRequest(@Email String email,
        @NotEmpty String firstName,
        @NotEmpty String lastName,
        @NotEmpty String password,
        @NotEmpty String confirmPassword,
        @NotNull RoleType type) {

}
