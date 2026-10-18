package com.cabride.bookings.services.imp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.cabride.bookings.dto.CreateRideRequest;
import com.cabride.bookings.dto.RideResponse;
import com.cabride.bookings.enums.BookingErrors;
import com.cabride.bookings.exceptions.BusinessException;
import com.cabride.bookings.models.Ride;
import com.cabride.bookings.models.RideStatus;
import com.cabride.bookings.properties.BookingProperties;
import com.cabride.bookings.repositories.RideRepository;
import com.cabride.bookings.services.CurrentUserService;
import com.cabride.bookings.services.RideBookingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RideBookingServiceImp implements RideBookingService {

    private final RideRepository rideRepository;

    private final BookingProperties properties;
    private final SimpMessagingTemplate messagingTemplate;

    private final CurrentUserService currentUser;

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
        afterCommit(() -> messagingTemplate.convertAndSend("/topic/ride-requests", response));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RideResponse> availableRideRequests() {
        return rideRepository.findByStatusOrderByCreatedAtAsc(RideStatus.REQUESTED).stream()
                .filter(ride -> !ride.getDeclinedDriverIds().contains(currentUser.userId()))
                .map(RideResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RideResponse getRideById(UUID rideId) {
        Ride ride = find(rideId);
        ensureParticipant(ride);
        return RideResponse.from(ride);
    }

    @Override
    @Transactional
    public RideResponse acceptRide(UUID rideId) {
        Ride ride = findForUpdate(rideId);
        UUID driverId = currentUser.userId();

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new BusinessException(BookingErrors.RIDE_CONFLICT, "This ride is no longer available.");
        }
        if (ride.getDeclinedDriverIds().contains(driverId)) {
            throw new BusinessException(BookingErrors.RIDE_CONFLICT, "You have already declined this ride.");
        }
        ride.setDriverId(driverId);

        ride.setAcceptedAt(Instant.now());
        ride.setStartedAt(Instant.now());
        ride.setStatus(RideStatus.IN_PROGRESS);
        Ride saved = rideRepository.saveAndFlush(ride);
        notifyParticipants(saved);
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
    @Transactional
    public RideResponse completeRide(UUID rideId) {
        Ride ride = findForUpdate(rideId);

        requireDriver(ride, currentUser.userId());
        requireStatus(ride, RideStatus.IN_PROGRESS, "Only an in-progress ride can be completed.");

        ride.setStatus(RideStatus.COMPLETED);
        ride.setCompletedAt(Instant.now());
        ride.setFinalFare(ride.getEstimatedFare());
        Ride saved = rideRepository.saveAndFlush(ride);
        notifyParticipants(saved);
        return RideResponse.from(saved);
    }

    @Override
    @Transactional
    public RideResponse cancelRide(UUID rideId) {
        Ride ride = findForUpdate(rideId);
        if (!ride.getRiderId().equals(currentUser.userId())) {
            throw new AccessDeniedException("Only the rider who created this ride can cancel it.");
        }
        if (ride.getStatus() != RideStatus.REQUESTED && ride.getStatus() != RideStatus.ACCEPTED) {
            throw new BusinessException(BookingErrors.RIDE_CONFLICT, "This ride can no longer be cancelled.");
        }
        ride.setStatus(RideStatus.CANCELLED);
        ride.setCancelledAt(Instant.now());
        Ride saved = rideRepository.saveAndFlush(ride);
        notifyParticipants(saved);
        return RideResponse.from(saved);
    }

    private BigDecimal calculateFare(double distanceMeters) {
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
                () -> new BusinessException(BookingErrors.RESOURCE_NOT_FOUND, "Ride with given Id not found."));
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

    private void notifyParticipants(Ride ride) {
        RideResponse payload = RideResponse.from(ride);
        afterCommit(() -> {
            messagingTemplate.convertAndSendToUser(ride.getRiderId().toString(), "/queue/ride-updates", payload);
            if (ride.getDriverId() != null) {
                messagingTemplate.convertAndSendToUser(ride.getDriverId().toString(), "/queue/ride-updates", payload);
            }
        });
    }

    private void afterCommit(Runnable action) {
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
