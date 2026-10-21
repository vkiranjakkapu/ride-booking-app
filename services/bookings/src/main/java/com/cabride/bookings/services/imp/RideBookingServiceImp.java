package com.cabride.bookings.services.imp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.cabride.bookings.dto.CreateRideRequest;
import com.cabride.bookings.dto.RideResponse;
import com.cabride.bookings.enums.BookingErrors;
import com.cabride.bookings.enums.RideStatus;
import com.cabride.bookings.exceptions.BusinessException;
import com.cabride.bookings.exceptions.SecurityException;
import com.cabride.bookings.models.Ride;
import com.cabride.bookings.properties.BookingProperties;
import com.cabride.bookings.repositories.RideRepository;
import com.cabride.bookings.services.CurrentUserService;
import com.cabride.bookings.services.RideBookingService;
import com.platform.web.exception.SecurityExceptions;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RideBookingServiceImp implements RideBookingService {

    private final RideRepository rideRepository;

    private final BookingProperties properties;
    private final SimpMessagingTemplate messagingTemplate;

    private final CurrentUserService currentUser;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    public Optional<RideResponse> activeRide() {
        UUID userId = currentUser.userId();
        return (currentUser.isDriver() ? rideRepository
                .findFirstByDriverIdAndStatusInOrderByUpdatedAtDesc(userId,
                        List.of(RideStatus.REQUESTED, RideStatus.ACCEPTED, RideStatus.IN_PROGRESS, RideStatus.PAID))
                : rideRepository
                        .findFirstByRiderIdAndStatusInOrderByUpdatedAtDesc(userId,
                                List.of(RideStatus.REQUESTED, RideStatus.ACCEPTED, RideStatus.IN_PROGRESS,
                                        RideStatus.PAID)))
                .map(ride -> RideResponse.from(ride));
    }

    @Override
    @Transactional
    public RideResponse create(CreateRideRequest request) {
        if (request.distanceMeters() > 500_000 || request.estimatedDurationSeconds() > 86_400) {
            throw new IllegalArgumentException("Route distance or duration exceeds the supported limit.");
        }
        if (samePoint(request.pickupLatitude(), request.pickupLongitude(),
                request.destinationLatitude(), request.destinationLongitude())) {
            throw new IllegalArgumentException("Pickup and destination must be different locations.");
        }
        Ride ride = new Ride();
        ride.setRiderId(currentUser.userId());
        ride.setOtp(generateOtp());
        ride.setPickupAddress(request.pickupAddress().trim());
        ride.setPickupLatitude(request.pickupLatitude());
        ride.setPickupLongitude(request.pickupLongitude());
        ride.setDestinationAddress(request.destinationAddress().trim());
        ride.setDestinationLatitude(request.destinationLatitude());
        ride.setDestinationLongitude(request.destinationLongitude());
        ride.setDistanceMeters(request.distanceMeters());
        ride.setEstimatedDurationSeconds(request.estimatedDurationSeconds());
        ride.setEstimatedFare(calculateFare(request.distanceMeters()));
        ride.setStatus(RideStatus.REQUESTED);
        Ride saved = rideRepository.saveAndFlush(ride);
        RideResponse response = RideResponse.from(saved);

        // Hiding rider details until ride acceptance
        response.setRiderId(null);

        afterCommit(() -> messagingTemplate.convertAndSend("/topic/ride-requests", response));
        return response;
    }

    private int generateOtp() {
        return 100_000 + SECURE_RANDOM.nextInt(900_000);
    }

    @Override
    @Transactional(readOnly = true)
    public RideResponse getRideById(UUID rideId) {
        Ride ride = find(rideId);
        ensureParticipant(ride);
        return RideResponse.from(ride);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getRideOtp(UUID rideId) {
        Ride ride = find(rideId);
        if (!ride.getRiderId().equals(currentUser.userId())) {
            throw new SecurityException(SecurityExceptions.FORBIDDEN_ACCESS);
        }
        return ride.getOtp();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RideResponse> availableRideRequests() {
        return rideRepository.findByStatusOrderByCreatedAtAsc(RideStatus.REQUESTED).stream()
                .filter(ride -> !ride.getDeclinedDriverIds().contains(currentUser.userId()))
                .map(RideResponse::from).toList();
    }

    @Override
    @Transactional
    public RideResponse acceptRide(UUID rideId) {
        Ride ride = findForUpdate(rideId);
        UUID driverId = currentUser.userId();

        if (ride.getStatus() != RideStatus.REQUESTED && ride.getStatus() != RideStatus.ACCEPTED) {
            throw new BusinessException(BookingErrors.RIDE_CONFLICT, "This ride is no longer available.");
        }
        if (ride.getDeclinedDriverIds().contains(driverId)) {
            throw new BusinessException(BookingErrors.RIDE_CONFLICT, "You have already declined this ride.");
        }

        ride.setDriverId(driverId);

        ride.setAcceptedAt(Instant.now());
        ride.setStatus(RideStatus.ACCEPTED);
        Ride saved = rideRepository.saveAndFlush(ride);

        return RideResponse.from(saved);
    }

    @Transactional
    public RideResponse start(UUID rideId, Integer otp) {
        Ride ride = findForUpdate(rideId);

        if (!ride.getOtp().equals(otp)) {
            throw new BusinessException(BookingErrors.INVALID_OTP);
        }

        requireDriver(ride, currentUser.userId());
        requireStatus(ride, RideStatus.ACCEPTED, "Only an accepted ride can be started.");
        ride.setStatus(RideStatus.IN_PROGRESS);
        ride.setStartedAt(Instant.now());
        Ride saved = rideRepository.saveAndFlush(ride);
        return RideResponse.from(saved);
    }

    @Override
    @Transactional
    public void declineRide(UUID rideId) {
        Ride ride = findForUpdate(rideId);
        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new BusinessException(BookingErrors.RIDE_CONFLICT, "Only pending rides can be declined.");
        }
        ride.getDeclinedDriverIds().add(currentUser.userId());
        rideRepository.save(ride);
    }

    @Override
    public RideResponse updatePayment(UUID rideId) {
        Ride ride = find(rideId);
        if (!ride.getRiderId().equals(currentUser.userId())) {
            throw new SecurityException(SecurityExceptions.FORBIDDEN_ACCESS,
                    "Only the rider who requested this ride can pay for this ride.");
        }
        ride.setStatus(RideStatus.PAID);
        ride.setFinalFare(ride.getEstimatedFare());

        return RideResponse.from(rideRepository.saveAndFlush(ride));
    }

    @Override
    @Transactional
    public RideResponse completeRide(UUID rideId) {
        Ride ride = findForUpdate(rideId);

        requireDriver(ride, currentUser.userId());
        requireStatus(ride, RideStatus.PAID,
                "Only an paid ride can be completed.");

        ride.setStatus(RideStatus.COMPLETED);
        ride.setCompletedAt(Instant.now());
        ride.setFinalFare(ride.getEstimatedFare());
        Ride saved = rideRepository.saveAndFlush(ride);

        return RideResponse.from(saved);
    }

    @Override
    @Transactional
    public RideResponse cancelRide(UUID rideId) {
        Ride ride = findForUpdate(rideId);
        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new BusinessException(BookingErrors.RIDE_CONFLICT, "This ride can no longer be cancelled.");
        }
        if (!ride.getRiderId().equals(currentUser.userId())) {
            throw new AccessDeniedException("Only the rider who created this ride can cancel it.");
        }
        ride.setStatus(RideStatus.CANCELLED);
        ride.setCancelledAt(Instant.now());
        Ride saved = rideRepository.saveAndFlush(ride);

        afterCommit(() -> messagingTemplate.convertAndSend("/topic/ride-requests",
                RideResponse.builder().id(rideId).status(saved.getStatus()).build()));

        return RideResponse.from(saved);
    }

    @Override
    public BigDecimal calculateFare(double distanceMeters) {
        BigDecimal distanceKm = BigDecimal.valueOf(distanceMeters).divide(BigDecimal.valueOf(1000), 3,
                RoundingMode.HALF_UP);
        BigDecimal calculated = properties.getBaseFare().add(properties.getPerKm().multiply(distanceKm));
        return calculated.max(properties.getMinimum()).setScale(2, RoundingMode.HALF_UP);
    }

    private boolean samePoint(double lat1, double lon1, double lat2, double lon2) {
        return Math.abs(lat1 - lat2) < 0.000001 && Math.abs(lon1 - lon2) < 0.000001;
    }

    private Ride find(UUID id) {
        return rideRepository.findById(id).orElseThrow(
                () -> new BusinessException(BookingErrors.RESOURCE_NOT_FOUND, "Ride with given Id not found.",
                        HttpStatus.NOT_FOUND));
    }

    private Ride findForUpdate(UUID id) {
        return rideRepository.findByIdForUpdate(id)
                .orElseThrow(
                        () -> new BusinessException(BookingErrors.RESOURCE_NOT_FOUND, "Ride with given Id not found."));
    }

    private void ensureParticipant(Ride ride) {
        UUID userId = currentUser.userId();
        if (!currentUser.isAdmin() && !userId.equals(ride.getRiderId()) && !userId.equals(ride.getDriverId())) {
            throw new AccessDeniedException("You do not have access to this ride.");
        }
    }

    private void requireDriver(Ride ride, UUID driverId) {
        if (!driverId.equals(ride.getDriverId()))
            throw new AccessDeniedException("This ride is assigned to another driver.");
    }

    private void requireStatus(Ride ride, RideStatus expected, String message) {
        if (ride.getStatus() != expected)
            throw new BusinessException(BookingErrors.RIDE_CONFLICT, message);
    }

    @Override
    public void notifyParticipants(RideResponse ride) {
        afterCommit(() -> {
            messagingTemplate.convertAndSendToUser(ride.getRiderId().toString(), "/queue/ride-updates", ride);
            if (ride.getDriverId() != null) {
                messagingTemplate.convertAndSendToUser(ride.getDriverId().toString(), "/queue/ride-updates", ride);
            }
        });
    }

    @Override
    public void afterCommit(Runnable action) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            action.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                action.run();
            }
        });
    }

}
