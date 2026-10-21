package com.cabride.bookings.services;

import java.util.List;

import com.cabride.bookings.dto.DriverDashboardSummaryDto;
import com.cabride.bookings.dto.DriverEarningsReportDto;
import com.cabride.bookings.dto.RideResponse;

public interface ReportsService {

    DriverDashboardSummaryDto getDriverDashboardSummary();

    DriverEarningsReportDto getDriverEarnings();

    List<RideResponse> getDriverRideHistory();
}