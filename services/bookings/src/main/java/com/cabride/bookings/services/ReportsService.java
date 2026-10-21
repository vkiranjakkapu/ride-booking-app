package com.cabride.bookings.services;

import java.util.List;

import com.cabride.bookings.dto.AdminDashboardSummaryDto;
import com.cabride.bookings.dto.DriverDashboardSummaryDto;
import com.cabride.bookings.dto.DriverEarningsReportDto;
import com.cabride.bookings.dto.RideResponse;
import com.cabride.bookings.dto.UserResponseDto;

public interface ReportsService {

    DriverDashboardSummaryDto getDriverDashboardSummary();

    DriverEarningsReportDto getDriverEarnings();

    List<RideResponse> getDriverRideHistory();

    AdminDashboardSummaryDto getAdminDashboardSummary();

    List<UserResponseDto> getAdminUsers();

}