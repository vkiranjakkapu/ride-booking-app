package com.cabride.bookings.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cabride.bookings.dto.AdminDashboardSummaryDto;
import com.cabride.bookings.dto.ApiResponseDto;
import com.cabride.bookings.dto.DriverDashboardSummaryDto;
import com.cabride.bookings.dto.DriverEarningsReportDto;
import com.cabride.bookings.dto.UserResponseDto;
import com.cabride.bookings.services.ReportsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/bookings/api/v1/reports")
@RequiredArgsConstructor
public class ReportsController {

	private final ReportsService reportsService;

	@GetMapping("/driver/dashboard")
	@PreAuthorize("hasRole('DRIVER')")
	public ResponseEntity<ApiResponseDto<DriverDashboardSummaryDto>> getDriverDashboardSummary() {

		return ResponseEntity.ok(
				ApiResponseDto.<DriverDashboardSummaryDto>builder()
						.data(reportsService.getDriverDashboardSummary())
						.build());
	}

	@GetMapping("/driver/earnings")
	@PreAuthorize("hasRole('DRIVER')")
	public ResponseEntity<ApiResponseDto<DriverEarningsReportDto>> getDriverEarnings() {

		return ResponseEntity.ok(
				ApiResponseDto.<DriverEarningsReportDto>builder()
						.data(reportsService.getDriverEarnings())
						.build());
	}

	@GetMapping("/admin/dashboard")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponseDto<AdminDashboardSummaryDto>> getAdminDashboardSummary() {

		return ResponseEntity.ok(
				ApiResponseDto.<AdminDashboardSummaryDto>builder()
						.data(reportsService.getAdminDashboardSummary())
						.build());
	}

	@GetMapping("/admin/users")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ApiResponseDto<List<UserResponseDto>>> getAdminUsers() {

		return ResponseEntity.ok(
				ApiResponseDto.<List<UserResponseDto>>builder()
						.data(reportsService.getAdminUsers())
						.build());
	}

}