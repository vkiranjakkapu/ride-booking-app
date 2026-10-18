package com.cabride.bookings.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cabride.bookings.models.Ride;
import com.cabride.bookings.models.RideStatus;

import jakarta.persistence.LockModeType;

public interface RideRepository extends JpaRepository<Ride, UUID> {
    List<Ride> findByRiderIdOrderByCreatedAtDesc(UUID riderId);

    List<Ride> findByDriverIdOrderByCreatedAtDesc(UUID driverId);

    List<Ride> findByStatusOrderByCreatedAtAsc(RideStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Ride r where r.id = :id")
    Optional<Ride> findByIdForUpdate(@Param("id") UUID id);

}
