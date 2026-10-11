import { Outlet, useNavigate } from "react-router-dom";
import useAuthContext from "../context/auth/useAuthContext";
import { RoutePaths } from "../routes/RoutePaths";

export default function DriverLayout() {
    const { isDriver } = useAuthContext();
    const navigate = useNavigate();

    if (!isDriver) {
        navigate(RoutePaths.DASHBOARD);
    }

    return <Outlet />;
}
