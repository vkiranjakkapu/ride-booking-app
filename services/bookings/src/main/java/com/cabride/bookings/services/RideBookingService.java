package com.cabride.bookings.services;

import java.util.List;
import java.util.UUID;

import com.cabride.bookings.dto.CreateRideRequest;
import com.cabride.bookings.dto.RideResponse;

public interface RideBookingService {

    RideResponse create(CreateRideRequest request);

    List<RideResponse> availableRideRequests();

    RideResponse getRideById(UUID rideId);

    RideResponse acceptRide(UUID rideId);

    void declineRide(UUID rideId);

    RideResponse completeRide(UUID rideId);

    RideResponse cancelRide(UUID rideId);

}