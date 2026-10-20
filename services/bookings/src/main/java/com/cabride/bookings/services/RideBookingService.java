package com.cabride.bookings.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.cabride.bookings.dto.CreateRideRequest;
import com.cabride.bookings.dto.RideResponse;

public interface RideBookingService {

    Optional<RideResponse> activeRide();

    BigDecimal calculateFare(double distanceMeters);
    
    RideResponse create(CreateRideRequest request);

    List<RideResponse> availableRideRequests();

    RideResponse getRideById(UUID rideId);

    Integer getRideOtp(UUID rideId);

    RideResponse acceptRide(UUID rideId);

    RideResponse start(UUID rideId, Integer otp);

    void declineRide(UUID rideId);

    RideResponse updatePayment(UUID rideId);

    RideResponse completeRide(UUID rideId);

    RideResponse cancelRide(UUID rideId);

    void notifyParticipants(RideResponse ride);

    void afterCommit(Runnable action);

}