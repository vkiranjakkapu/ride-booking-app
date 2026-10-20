import { apiClient, type ApiResponse } from "../api/api";

export const RideStatus = {
    REQUESTED: "REQUESTED",
    ACCEPTED: "ACCEPTED",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    PAID: "PAID",
    CANCELLED: "CANCELLED",
};

export type RideStatus = (typeof RideStatus)[keyof typeof RideStatus];

export type Ride = {
    id: string;

    riderId: string;
    riderName?: string;
    riderPhone?: string;
    riderEmail?: string;

    driverId: string | null;
    driverName?: string;
    driverPhone?: string;
    driverEmail?: string;
    vehicleNumber?: string;

    pickupAddress: string;
    pickupLatitude: number;
    pickupLongitude: number;

    destinationAddress: string;
    destinationLatitude: number;
    destinationLongitude: number;

    distanceMeters: number;
    estimatedDurationSeconds: number;

    estimatedFare: number;
    finalFare: number | null;

    status: RideStatus;

    acceptedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;

    createdAt: string;
};

class RideService {
    async getFare<T>(distanceInMeters: number): Promise<ApiResponse<T>> {
        return apiClient({
            type: "get",
            service: "rides",
            uri: `/fare/${distanceInMeters}`,
        });
    }

    async getActiveRide<T>(): Promise<ApiResponse<T>> {
        return apiClient({
            type: "get",
            service: "rides",
            uri: `/active`,
        });
    }

    async createRideRequest<T>(payload: {
        pickupAddress: string;
        pickupLatitude: number;
        pickupLongitude: number;
        destinationAddress: string;
        destinationLatitude: number;
        destinationLongitude: number;
        distanceMeters: number;
        estimatedDurationSeconds: number;
    }): Promise<ApiResponse<T>> {
        return apiClient({
            type: "post",
            service: "rides",
            uri: "/",
            payload,
        });
    }

    async getRideOtp(id: string): Promise<ApiResponse<number>> {
        return apiClient({
            type: "get",
            service: "rides",
            uri: `/${id}/otp`,
        });
    }

    async getAvailableRideRequests<T>(): Promise<ApiResponse<T>> {
        return apiClient({
            type: "get",
            service: "rides",
            uri: `/`,
        });
    }

    async getRideById<T>(id: string): Promise<ApiResponse<T>> {
        return apiClient({
            type: "get",
            service: "rides",
            uri: `/${id}`,
        });
    }

    async acceptRide<T>(id: string): Promise<ApiResponse<T>> {
        return apiClient({
            type: "post",
            service: "rides",
            uri: `/${id}/accept`,
        });
    }

    async startRide<T>(id: string, otp: string): Promise<ApiResponse<T>> {
        return apiClient({
            type: "post",
            service: "rides",
            uri: `/${id}/start`,
            payload: { otp },
        });
    }

    async declineRequest(id: string): Promise<ApiResponse<void>> {
        return apiClient({
            type: "post",
            service: "rides",
            uri: `/${id}/decline`,
        });
    }

    async payRideFare<T>(id: string): Promise<ApiResponse<T>> {
        return apiClient({
            type: "post",
            service: "rides",
            uri: `/${id}/payment`,
        });
    }

    async completeRide<T>(id: string): Promise<ApiResponse<T>> {
        return apiClient({
            type: "post",
            service: "rides",
            uri: `/${id}/complete`,
        });
    }

    async cancelRide<T>(id: string): Promise<ApiResponse<T>> {
        return apiClient({
            type: "post",
            service: "rides",
            uri: `/${id}/cancel`,
        });
    }
}

export default new RideService();
