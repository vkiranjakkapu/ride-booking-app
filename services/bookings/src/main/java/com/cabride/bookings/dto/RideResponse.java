package com.cabride.bookings.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.cabride.bookings.enums.RideStatus;
import com.cabride.bookings.models.Ride;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class RideResponse {

    private UUID id;

    private UUID riderId;
    private String riderName;
    private String riderPhone;
    private String riderEmail;

    private UUID driverId;
    private String driverName;
    private String driverPhone;
    private String driverEmail;
    private String vehicleNumber;

    private String pickupAddress;
    private double pickupLatitude;
    private double pickupLongitude;

    private String destinationAddress;
    private double destinationLatitude;
    private double destinationLongitude;

    private double distanceMeters;
    private long estimatedDurationSeconds;

    private BigDecimal estimatedFare;
    private BigDecimal finalFare;

    private RideStatus status;

    private Instant createdAt;
    private Instant acceptedAt;
    private Instant startedAt;
    private Instant completedAt;
    private Instant cancelledAt;

    public static RideResponse from(Ride ride) {
        return new RideResponse(
                ride.getId(),

                ride.getRiderId(),
                null,
                null,
                null,

                ride.getDriverId(),
                null,
                null,
                null,
                null,

                ride.getPickupAddress(), ride.getPickupLatitude(), ride.getPickupLongitude(),
                ride.getDestinationAddress(), ride.getDestinationLatitude(), ride.getDestinationLongitude(),
                ride.getDistanceMeters(), ride.getEstimatedDurationSeconds(), ride.getEstimatedFare(),
                ride.getFinalFare(), ride.getStatus(), ride.getCreatedAt(), ride.getAcceptedAt(),
                ride.getStartedAt(), ride.getCompletedAt(), ride.getCancelledAt());
    }

    public static RideResponse from(RideResponse ride, UserResponseDto rider, UserResponseDto driver) {
        return new RideResponse(
                ride.getId(),

                ride.getRiderId(),
                rider.firstName() + " " + rider.lastName(),
                rider.email(),
                rider.phone(),

                ride.getDriverId(),
                driver.firstName() + " " + driver.lastName(),
                driver.email(),
                driver.phone(),
                driver.vehicleNumber(),

                ride.getPickupAddress(), ride.getPickupLatitude(), ride.getPickupLongitude(),
                ride.getDestinationAddress(), ride.getDestinationLatitude(), ride.getDestinationLongitude(),
                ride.getDistanceMeters(), ride.getEstimatedDurationSeconds(), ride.getEstimatedFare(),
                ride.getFinalFare(), ride.getStatus(), ride.getCreatedAt(), ride.getAcceptedAt(),
                ride.getStartedAt(), ride.getCompletedAt(), ride.getCancelledAt());
    }
}
