import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import useAuthContext, { AuthStatus } from "../context/auth/useAuthContext";
import { RoutePaths } from "../routes/RoutePaths";

export default function ProtectedLayout() {
    const { isLoggedIn, status } = useAuthContext();

    if (status === AuthStatus.INITIALIZING) {
        return;
    }

    if (!isLoggedIn) {
        return <Navigate to={RoutePaths.LANDING} />;
    }

    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
}
