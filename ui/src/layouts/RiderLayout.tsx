import { Navigate, Outlet } from "react-router-dom";
import useAuthContext from "../context/auth/useAuthContext";
import { RoutePaths } from "../routes/RoutePaths";

export default function RiderLayout() {
    const { isRider } = useAuthContext();

    if (!isRider) {
        return <Navigate to={RoutePaths.DASHBOARD} />;
    }

    return <Outlet />;
}
