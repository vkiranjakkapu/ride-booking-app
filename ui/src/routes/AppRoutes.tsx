import { Route, Routes } from "react-router-dom";
import DriverLayout from "../layouts/DriverLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";
import PublicLayout from "../layouts/PublicLayout";
import RiderLayout from "../layouts/RiderLayout";
import RideBookingPage from "../pages/booking/RideBookingPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import EnroutePage from "../pages/enroute/EnroutePage";
import HistoryPage from "../pages/history/HistoryPage";
import LandingPage from "../pages/landing/LandingPage";
import ProfilePage from "../pages/profile/ProfilePage";
import RideRequestsPage from "../pages/ride-requests/RideRequestsPage";
import { RoutePaths } from "./RoutePaths";
import NonDriverLayout from "../layouts/NonDriverLayout";

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path={RoutePaths.LANDING} element={<LandingPage />} />
            </Route>
            <Route element={<ProtectedLayout />}>
                <Route
                    path={RoutePaths.DASHBOARD}
                    element={<DashboardPage />}
                />
                <Route path={RoutePaths.ENROUTE} element={<EnroutePage />} />
                <Route path={RoutePaths.MANAGE} element={<ProfilePage />} />
                <Route path={RoutePaths.HISTORY} element={<HistoryPage />} />

                <Route element={<DriverLayout />}>
                    <Route
                        path={RoutePaths.RIDE_REQUESTS}
                        element={<RideRequestsPage />}
                    />
                </Route>

                <Route element={<NonDriverLayout />}>
                    <Route
                        path={RoutePaths.BOOKING}
                        element={<RideBookingPage />}
                    />
                </Route>

                <Route element={<RiderLayout />}>
                    <Route
                        path={RoutePaths.RIDER_DASHBOARD}
                        element={<EnroutePage />}
                    />
                </Route>
            </Route>
        </Routes>
    );
}
