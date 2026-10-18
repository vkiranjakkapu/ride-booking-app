package com.cabride.bookings.services;

import java.util.List;

import com.cabride.bookings.dto.RideResponse;

public interface BookingsService {

    List<RideResponse> myRides();

}