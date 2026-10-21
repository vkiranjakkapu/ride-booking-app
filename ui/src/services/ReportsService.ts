import { apiClient, type ApiResponse } from "../api/api";
import type { UserProfile } from "../context/auth/useAuthContext";
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

export type AdminDashboardSummary = {
    totalUsers: number;
    totalDrivers: number;
    totalRides: number;
    completedRides: number;
    activeRides: number;
    totalRevenue: number;
};

export type AdminUser = {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    phone?: string;
    roles?: string[];
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

    async getAdminDashboardSummary(): Promise<
        ApiResponse<AdminDashboardSummary>
    > {
        return apiClient({
            type: "get",
            service: "bookings",
            uri: "/reports/admin/dashboard",
        });
    }

    async getAdminRideHistory(): Promise<ApiResponse<Ride[]>> {
        return apiClient({
            type: "get",
            service: "bookings",
            uri: "/reports/admin/rides",
        });
    }

    async getAdminUsers(): Promise<ApiResponse<UserProfile[]>> {
        return apiClient({
            type: "get",
            service: "bookings",
            uri: "/reports/admin/users",
        });
    }
}

export default new ReportsService();
