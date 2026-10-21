package com.cabride.bookings.controllers;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cabride.bookings.dto.ApiResponseDto;
import com.cabride.bookings.dto.RideResponse;
import com.cabride.bookings.dto.UserResponseDto;
import com.cabride.bookings.services.BookingsService;
import com.cabride.bookings.services.CurrentUserService;
import com.cabride.bookings.services.IdentityService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/bookings/api/v1")
@RequiredArgsConstructor
public class BookingsController {

    private final BookingsService bookingsService;
    private final IdentityService identityService;
    private final CurrentUserService currentUser;

    @GetMapping("/")
    public ResponseEntity<ApiResponseDto<List<RideResponse>>> getAllRides() {
        List<RideResponse> allRides = bookingsService.getAllRides();

        if (currentUser.isAdmin()) {
            Map<UUID, UserResponseDto> userMap = identityService
                    .getAllUsersByIds(
                            allRides.stream().flatMap(ride -> Stream.of(ride.getDriverId(), ride.getRiderId()))
                                    .filter(Objects::nonNull)
                                    .collect(Collectors.toSet()));

            allRides = allRides.stream().map(ride -> {
                UserResponseDto rider = userMap.get(ride.getRiderId());
                UserResponseDto driver = userMap.get(ride.getDriverId());

                return RideResponse.from(ride, rider, driver);
            }).toList();
        }

        return ResponseEntity.ok(ApiResponseDto.<List<RideResponse>>builder()
                .data(allRides).build());
    }

}
