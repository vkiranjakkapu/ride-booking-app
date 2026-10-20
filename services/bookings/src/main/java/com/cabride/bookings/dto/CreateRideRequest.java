package com.cabride.bookings.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreateRideRequest(
        @NotBlank @Size(max = 500) String pickupAddress,
        @DecimalMin("-90.0") @DecimalMax("90.0") double pickupLatitude,
        @DecimalMin("-180.0") @DecimalMax("180.0") double pickupLongitude,
        @NotBlank @Size(max = 500) String destinationAddress,
        @DecimalMin("-90.0") @DecimalMax("90.0") double destinationLatitude,
        @DecimalMin("-180.0") @DecimalMax("180.0") double destinationLongitude,
        @Positive double distanceMeters,
        @PositiveOrZero long estimatedDurationSeconds) {
}
