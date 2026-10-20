package com.cabride.bookings.services.imp;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.cabride.bookings.exceptions.BusinessException;
import com.cabride.bookings.services.CurrentUserService;
import com.platform.security.context.AuthenticationContext;
import com.platform.security.model.AuthenticatedUser;
import com.platform.web.exception.SecurityExceptions;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CurrentUserServiceImp implements CurrentUserService {

    private final AuthenticationContext authenticationContext;

    @Override
    public AuthenticatedUser currentUser() {
        return authenticationContext.getCurrentUser()
                .orElseThrow(() -> new BusinessException(SecurityExceptions.FORBIDDEN_ACCESS, "No authenticated user"));
    }

    @Override
    public UUID userId() {
        return UUID.fromString(currentUser().getUserId());
    }

    @Override
    public String username() {
        return currentUser().getUsername();
    }

    @Override
    public String email() {
        return currentUser().getEmail();
    }

    @Override
    public boolean isAdmin() {
        return currentUser().getAuthorities().contains("ROLE_ADMIN");
    }

    @Override
    public boolean isRider() {
        return currentUser().getAuthorities().contains("ROLE_RIDER");
    }

    @Override
    public boolean isDriver() {
        return currentUser().getAuthorities().contains("ROLE_DRIVER");
    }

}
