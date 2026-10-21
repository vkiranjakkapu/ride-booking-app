package com.cabride.bookings.controllers;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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
import com.cabride.bookings.dto.StartRideRequestDto;
import com.cabride.bookings.dto.UserResponseDto;
import com.cabride.bookings.enums.BookingErrors;
import com.cabride.bookings.exceptions.BusinessException;
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
				ApiResponseDto.<List<RideResponse>>builder().data(rideService.availableRideRequests())
						.build());
	}

	@GetMapping("/active")
	@PreAuthorize("hasAnyRole('RIDER','DRIVER','ADMIN')")
	public ResponseEntity<ApiResponseDto<RideResponse>> getActiveRide() {
		Optional<RideResponse> ride = rideService.activeRide();

		if (ride.isEmpty()) {
			return ResponseEntity.noContent().build();
		}

		RideResponse response = ride.get();
		Map<UUID, UserResponseDto> usersMap = identityService
				.getAllUsersByIds(
						Stream.of(response.getRiderId(), response.getDriverId())
								.filter(Objects::nonNull)
								.collect(Collectors.toSet()));

		Optional.ofNullable(response.getRiderId()).ifPresent(riderId -> {
			UserResponseDto rider = usersMap.get(riderId);
			response.setRiderName(rider.firstName() + " " + rider.lastName());
			response.setRiderEmail(rider.email());
			response.setRiderPhone(rider.phone());
		});

		Optional.ofNullable(response.getDriverId()).ifPresent(driverId -> {
			UserResponseDto driver = usersMap.get(driverId);
			response.setDriverName(driver.firstName() + " " + driver.lastName());
			response.setDriverEmail(driver.email());
			response.setDriverPhone(driver.phone());
			response.setVehicleNumber(driver.vehicleNumber());
		});

		return ResponseEntity.ok(ApiResponseDto.<RideResponse>builder().data(response).build());
	}

	@GetMapping("/fare/{distanceInMeters}")
	public ResponseEntity<ApiResponseDto<BigDecimal>> getRideFareForDistance(@PathVariable Double distanceInMeters) {
		return ResponseEntity
				.ok(ApiResponseDto.<BigDecimal>builder().data(rideService.calculateFare(distanceInMeters)).build());
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
	@PreAuthorize("hasAnyRole('RIDER','ADMIN')")
	public ResponseEntity<ApiResponseDto<RideResponse>> create(@Valid @RequestBody CreateRideRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponseDto.<RideResponse>builder().data(rideService.create(request))
						.build());
	}

	@PostMapping("/{rideId}/accept")
	@PreAuthorize("hasRole('DRIVER')")
	public ResponseEntity<ApiResponseDto<RideResponse>> accept(@PathVariable UUID rideId) {
		if (rideService.activeRide().isPresent())
			throw new BusinessException(BookingErrors.RIDE_CONFLICT,
					"You can't accept other rides while one is in progress", HttpStatus.CONFLICT);

		RideResponse ride = rideService.acceptRide(rideId);

		Map<UUID, UserResponseDto> userMap = identityService
				.getAllUsersByIds(Stream.of(ride.getRiderId(), ride.getDriverId())
						.filter(Objects::nonNull)
						.collect(Collectors.toSet()));

		UserResponseDto rider = userMap.get(ride.getRiderId());
		UserResponseDto driver = userMap.get(ride.getDriverId());

		RideResponse response = RideResponse.from(ride, rider, driver);
		rideService.notifyParticipants(response);
		return ResponseEntity.ok(
				ApiResponseDto.<RideResponse>builder().data(response).build());
	}

	@GetMapping("/{rideId}/otp")
	@PreAuthorize("hasAnyRole('RIDER','ADMIN')")
	public ResponseEntity<ApiResponseDto<Integer>> getRideOtp(@PathVariable UUID rideId) {
		return ResponseEntity.ok(ApiResponseDto.<Integer>builder().data(rideService.getRideOtp(rideId)).build());
	}

	@PostMapping("/{rideId}/start")
	@PreAuthorize("hasRole('DRIVER')")
	public ResponseEntity<ApiResponseDto<RideResponse>> start(@PathVariable UUID rideId,
			@RequestBody StartRideRequestDto request) {
		RideResponse ride = rideService.start(rideId, request.otp());

		Map<UUID, UserResponseDto> userMap = identityService
				.getAllUsersByIds(Stream.of(ride.getRiderId(), ride.getDriverId())
						.filter(Objects::nonNull)
						.collect(Collectors.toSet()));

		UserResponseDto rider = userMap.get(ride.getRiderId());
		UserResponseDto driver = userMap.get(ride.getDriverId());

		RideResponse response = RideResponse.from(ride, rider, driver);
		rideService.notifyParticipants(response);

		return ResponseEntity
				.ok(ApiResponseDto.<RideResponse>builder().data(response).build());
	}

	@PostMapping("/{rideId}/decline")
	@PreAuthorize("hasRole('DRIVER')")
	public ResponseEntity<Void> decline(@PathVariable UUID rideId) {
		rideService.declineRide(rideId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{rideId}/payment")
	@PreAuthorize("hasAnyRole('RIDER', 'ADMIN')")
	public ResponseEntity<ApiResponseDto<RideResponse>> paymentUpdate(@PathVariable UUID rideId) {
		RideResponse ride = rideService.updatePayment(rideId);

		Map<UUID, UserResponseDto> userMap = identityService
				.getAllUsersByIds(Stream.of(ride.getRiderId(), ride.getDriverId())
						.filter(Objects::nonNull)
						.collect(Collectors.toSet()));

		UserResponseDto rider = userMap.get(ride.getRiderId());
		UserResponseDto driver = userMap.get(ride.getDriverId());

		RideResponse response = RideResponse.from(ride, rider, driver);
		rideService.notifyParticipants(response);
		return ResponseEntity.ok(ApiResponseDto.<RideResponse>builder().data(response).build());
	}

	@PostMapping("/{rideId}/complete")
	@PreAuthorize("hasRole('DRIVER')")
	public ResponseEntity<ApiResponseDto<RideResponse>> complete(@PathVariable UUID rideId) {
		RideResponse response = rideService.completeRide(rideId);

		Map<UUID, UserResponseDto> usersMap = identityService
				.getAllUsersByIds(
						Stream.of(response.getRiderId(), response.getDriverId())
								.filter(Objects::nonNull)
								.collect(Collectors.toSet()));

		UserResponseDto rider = usersMap.get(response.getRiderId());
		response.setRiderName(rider.firstName() + " " + rider.lastName());
		response.setRiderEmail(rider.email());
		response.setRiderPhone(rider.phone());

		UserResponseDto driver = usersMap.get(response.getDriverId());
		response.setDriverName(driver.firstName() + " " + driver.lastName());
		response.setDriverEmail(driver.email());
		response.setDriverPhone(driver.phone());
		response.setVehicleNumber(driver.vehicleNumber());

		rideService.notifyParticipants(response);
		return ResponseEntity.ok(ApiResponseDto.<RideResponse>builder()
				.data(response).build());
	}

	@PostMapping("/{rideId}/cancel")
	@PreAuthorize("hasAnyRole('RIDER','ADMIN')")
	public ResponseEntity<ApiResponseDto<RideResponse>> cancel(@PathVariable UUID rideId) {
		return ResponseEntity.ok(
				ApiResponseDto.<RideResponse>builder().data(rideService.cancelRide(rideId)).build());
	}

}
