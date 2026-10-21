package com.cabride.bookings.dto;

import java.math.BigDecimal;

public record AdminDashboardSummaryDto(
		long totalUsers,
		long totalDrivers,
		long totalRides,
		long completedRides,
		long activeRides,
		BigDecimal totalRevenue) {
}