package com.cabride.bookings.dto;

import java.math.BigDecimal;

public record DriverEarningsReportDto(
		long completedRides,
		BigDecimal totalEarnings) {
}