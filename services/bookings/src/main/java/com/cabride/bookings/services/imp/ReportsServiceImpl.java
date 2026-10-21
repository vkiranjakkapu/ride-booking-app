package com.cabride.bookings.services.imp;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cabride.bookings.dto.DriverDashboardSummaryDto;
import com.cabride.bookings.dto.DriverEarningsReportDto;
import com.cabride.bookings.dto.RideResponse;
import com.cabride.bookings.enums.RideStatus;
import com.cabride.bookings.models.Ride;
import com.cabride.bookings.repositories.RideRepository;
import com.cabride.bookings.services.CurrentUserService;
import com.cabride.bookings.services.ReportsService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportsServiceImpl implements ReportsService {

	private static final Set<RideStatus> ACTIVE_STATUSES = Set.of(
			RideStatus.ACCEPTED,
			RideStatus.IN_PROGRESS,
			RideStatus.PAID);

	private final RideRepository rideRepository;
	private final CurrentUserService currentUserService;

	@Override
	public DriverDashboardSummaryDto getDriverDashboardSummary() {
		List<Ride> rides = getCurrentDriverRides();

		long completedRides = rides.stream()
				.filter(ride -> ride.getStatus() == RideStatus.COMPLETED)
				.count();

		long activeRides = rides.stream()
				.filter(ride -> ACTIVE_STATUSES.contains(ride.getStatus()))
				.count();

		BigDecimal totalEarnings = calculateTotalEarnings(rides);

		return new DriverDashboardSummaryDto(
				rides.size(),
				completedRides,
				activeRides,
				totalEarnings);
	}

	@Override
	public DriverEarningsReportDto getDriverEarnings() {
		List<Ride> rides = getCurrentDriverRides();

		long completedRides = rides.stream()
				.filter(ride -> ride.getStatus() == RideStatus.COMPLETED)
				.count();

		return new DriverEarningsReportDto(
				completedRides,
				calculateTotalEarnings(rides));
	}

	@Override
	public List<RideResponse> getDriverRideHistory() {
		return getCurrentDriverRides().stream()
				.map(RideResponse::from)
				.toList();
	}

	private List<Ride> getCurrentDriverRides() {
		UUID driverId = currentUserService.userId();

		return rideRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
	}

	private BigDecimal calculateTotalEarnings(List<Ride> rides) {
		return rides.stream()
				.filter(ride -> ride.getStatus() == RideStatus.COMPLETED)
				.map(Ride::getFinalFare)
				.filter(fare -> fare != null)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
	}
}