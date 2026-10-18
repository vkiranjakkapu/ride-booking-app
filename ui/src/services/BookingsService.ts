import { apiClient, type ApiResponse } from "../api/api";

class BookingsService {
    async getMyRides<T>(): Promise<ApiResponse<T>> {
        return apiClient({
            type: "get",
            service: "bookings",
            uri: `/`,
        });
    }
}

export default new BookingsService();
