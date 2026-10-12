export const AppConfig = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    IDENTITY_AUTH_URL: "/identity/api/v1/auth",
    IDENTITY_PROFILE_URL: "/identity/api/v1/users",
    BOOKINGS_SERVICE_URL: "/bookings/api/v1",

    BOOKINGS_RIDES_URL: "/bookings/api/v1/ws/rides",
    BOOKINGS_LOCATION_UPDATES_URL: "/bookings/api/v1/ws/app/location",
    BOOKINGS_USERS_URL: "/bookings/api/v1/ws/users",

    LOCAL_AUTH_KEY: "cabride",
    PUBLIC_ENDPOINTS: ["/auth", "/register"],
} as const;
