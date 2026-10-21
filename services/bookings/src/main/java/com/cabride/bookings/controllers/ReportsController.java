package com.cabride.bookings.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cabride.bookings.dto.ApiResponseDto;
import com.cabride.bookings.dto.DriverDashboardSummaryDto;
import com.cabride.bookings.dto.DriverEarningsReportDto;
import com.cabride.bookings.dto.RideResponse;
import com.cabride.bookings.services.ReportsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/bookings/api/v1/reports/driver")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DRIVER')")
public class ReportsController {

	private final ReportsService reportsService;

	@GetMapping("/dashboard")
	public ResponseEntity<ApiResponseDto<DriverDashboardSummaryDto>> getDriverDashboardSummary() {

		return ResponseEntity.ok(
				ApiResponseDto.<DriverDashboardSummaryDto>builder()
						.data(reportsService.getDriverDashboardSummary())
						.build());
	}

	@GetMapping("/earnings")
	public ResponseEntity<ApiResponseDto<DriverEarningsReportDto>> getDriverEarnings() {

		return ResponseEntity.ok(
				ApiResponseDto.<DriverEarningsReportDto>builder()
						.data(reportsService.getDriverEarnings())
						.build());
	}

	@GetMapping("/ride-history")
	public ResponseEntity<ApiResponseDto<List<RideResponse>>> getDriverRideHistory() {

		return ResponseEntity.ok(
				ApiResponseDto.<List<RideResponse>>builder()
						.data(reportsService.getDriverRideHistory())
						.build());
	}
}