import { apiClient, type ApiResponse } from "../api/api";
import type { Ride } from "./RideService";

export type DriverDashboardSummary = {
    totalRides: number;
    completedRides: number;
    activeRides: number;
    totalEarnings: number;
};

export type DriverEarningsReport = {
    completedRides: number;
    totalEarnings: number;
};

class ReportsService {
    async getDriverDashboardSummary(): Promise<
        ApiResponse<DriverDashboardSummary>
    > {
        return apiClient({
            type: "get",
            service: "bookings",
            uri: "/reports/driver/dashboard",
        });
    }

    async getDriverEarnings(): Promise<ApiResponse<DriverEarningsReport>> {
        return apiClient({
            type: "get",
            service: "bookings",
            uri: "/reports/driver/earnings",
        });
    }

    async getDriverRideHistory(): Promise<ApiResponse<Ride[]>> {
        return apiClient({
            type: "get",
            service: "bookings",
            uri: "/reports/driver/ride-history",
        });
    }
}

export default new ReportsService();