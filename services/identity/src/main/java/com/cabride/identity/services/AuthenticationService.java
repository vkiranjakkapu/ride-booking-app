package com.cabride.identity.services;

import com.cabride.identity.dto.LoginRequestDto;
import com.cabride.identity.dto.LoginResponseDto;
import com.cabride.identity.dto.LogoutRequestDto;
import com.cabride.identity.dto.RefreshTokenRequest;
import com.cabride.identity.dto.RefreshTokenResponse;

public interface AuthenticationService {

    LoginResponseDto login(LoginRequestDto request);

    RefreshTokenResponse refresh(RefreshTokenRequest request);

    void logout(LogoutRequestDto request);

}