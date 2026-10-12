import { Navigate, Outlet } from "react-router-dom";
import useAuthContext from "../context/auth/useAuthContext";
import { RoutePaths } from "../routes/RoutePaths";

export default function DriverLayout() {
    const { isDriver } = useAuthContext();

    if (!isDriver) {
        return <Navigate to={RoutePaths.DASHBOARD} />;
    }

    return <Outlet />;
}
