package com.cabride.bookings.controllers;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cabride.bookings.dto.ApiResponseDto;
import com.cabride.bookings.dto.CreateRideRequest;
import com.cabride.bookings.dto.RideResponse;
import com.cabride.bookings.dto.UserResponseDto;
import com.cabride.bookings.services.IdentityService;
import com.cabride.bookings.services.RideBookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/bookings/api/v1/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideBookingService rideService;
    private final IdentityService identityService;

    @GetMapping("/")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponseDto<List<RideResponse>>> available() {
        return ResponseEntity.ok(
                ApiResponseDto.<List<RideResponse>>builder().data(rideService.availableRideRequests()).build());
    }

    @GetMapping("/{rideId}")
    @PreAuthorize("hasAnyRole('RIDER','DRIVER','ADMIN')")
    public ResponseEntity<ApiResponseDto<RideResponse>> getRideById(@PathVariable UUID rideId) {
        RideResponse ride = rideService.getRideById(rideId);

        Map<UUID, UserResponseDto> usersMap = identityService
                .getAllUsersByIds(
                        Stream.of(ride.getRiderId(), ride.getDriverId())
                                .filter(Objects::nonNull)
                                .collect(Collectors.toSet()));

        Optional.ofNullable(ride.getRiderId()).ifPresent(riderId -> {
            UserResponseDto rider = usersMap.get(riderId);
            ride.setRiderName(rider.firstName() + " " + rider.lastName());
            ride.setRiderEmail(rider.email());
            ride.setRiderPhone(rider.phone());
        });

        Optional.ofNullable(ride.getDriverId()).ifPresent(driverId -> {
            UserResponseDto driver = usersMap.get(driverId);
            ride.setDriverName(driver.firstName() + " " + driver.lastName());
            ride.setDriverEmail(driver.email());
            ride.setDriverPhone(driver.phone());
        });

        return ResponseEntity.ok(ApiResponseDto.<RideResponse>builder()
                .data(ride).build());
    }

    @PostMapping("/")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<ApiResponseDto<RideResponse>> create(@Valid @RequestBody CreateRideRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDto.<RideResponse>builder().data(rideService.create(request))
                        .build());
    }

    @PostMapping("/{rideId}/accept")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponseDto<RideResponse>> accept(@PathVariable UUID rideId) {
        RideResponse ride = rideService.acceptRide(rideId);

        Map<UUID, UserResponseDto> userMap = identityService
                .getAllUsersByIds(Set.of(ride.getRiderId(), ride.getDriverId()));

        UserResponseDto rider = userMap.get(ride.getRiderId());
        UserResponseDto driver = userMap.get(ride.getDriverId());

        return ResponseEntity.ok(
                ApiResponseDto.<RideResponse>builder().data(RideResponse.from(ride, rider, driver)).build());
    }

    @PostMapping("/{rideId}/decline")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> decline(@PathVariable UUID rideId) {
        rideService.declineRide(rideId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{rideId}/complete")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<ApiResponseDto<RideResponse>> complete(@PathVariable UUID rideId) {
        return ResponseEntity.ok(ApiResponseDto.<RideResponse>builder()
                .data(rideService.completeRide(rideId)).build());
    }

    @PostMapping("/{rideId}/cancel")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<ApiResponseDto<RideResponse>> cancel(@PathVariable UUID rideId) {
        return ResponseEntity.ok(
                ApiResponseDto.<RideResponse>builder().data(rideService.cancelRide(rideId)).build());
    }

}
