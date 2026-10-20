export const RoutePaths = {
    LANDING: "/",

    DASHBOARD: "/dashboard",
    RIDER_DASHBOARD: "/dashboard/:rideId",
    RIDE_REQUESTS: "/rides",

    BOOKING: "/booking",
    ENROUTE: "/rides/:rideId",

    HISTORY: "/history",

    MANAGE: "/profile",
} as const;
