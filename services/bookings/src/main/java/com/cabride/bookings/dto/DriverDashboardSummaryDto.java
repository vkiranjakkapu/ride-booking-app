package com.cabride.bookings.dto;

import java.math.BigDecimal;

public record DriverDashboardSummaryDto(
		long totalRides,
		long completedRides,
		long activeRides,
		BigDecimal totalEarnings) {
}
