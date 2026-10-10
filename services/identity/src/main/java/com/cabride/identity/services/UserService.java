package com.cabride.identity.services;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import com.cabride.identity.dto.CreateUserRequestDto;
import com.cabride.identity.dto.PasswordChangeRequestDto;
import com.cabride.identity.dto.RegistrationRequest;
import com.cabride.identity.dto.UpdateUserRequest;
import com.cabride.identity.dto.UserResponse;
import com.cabride.identity.entities.RoleType;

public interface UserService {
    UserResponse createUser(CreateUserRequestDto request);

    List<UserResponse> getAllUsers();

    List<UserResponse> getAllUsersByRole(RoleType role);

    List<UserResponse> getAllUsersWithIds(Collection<UUID> ids);

    UserResponse getUserById(UUID id);

    UserResponse getUserByEmail(String email);

    UserResponse register(RegistrationRequest request);

    UserResponse updateUser(UUID id, UpdateUserRequest request);

    UserResponse changePassword(PasswordChangeRequestDto request);

    void deleteUser(UUID id);
}