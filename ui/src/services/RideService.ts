import { apiClient, type ApiResponse } from "../api/api";

export const RideStatus = {
    REQUESTED: "REQUESTED",
    ACCEPTED: "ACCEPTED",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
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

    async declineRequest(id: string): Promise<ApiResponse<void>> {
        return apiClient({
            type: "post",
            service: "rides",
            uri: `/${id}/decline`,
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
