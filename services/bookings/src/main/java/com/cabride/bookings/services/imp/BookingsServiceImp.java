package com.cabride.bookings.services.imp;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cabride.bookings.dto.RideResponse;
import com.cabride.bookings.repositories.RideRepository;
import com.cabride.bookings.services.BookingsService;
import com.cabride.bookings.services.CurrentUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingsServiceImp implements BookingsService {

    private final RideRepository rideRepository;
    private final CurrentUserService currentUser;

    @Override
    @Transactional(readOnly = true)
    public List<RideResponse> myRides() {
        UUID userId = currentUser.userId();

        return (currentUser.isDriver() ? rideRepository.findByDriverIdOrderByCreatedAtDesc(userId)
                : rideRepository.findByRiderIdOrderByCreatedAtDesc(userId))
                .stream().map(RideResponse::from).toList();
    }
}
