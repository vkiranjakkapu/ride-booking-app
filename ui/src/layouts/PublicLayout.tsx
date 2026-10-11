import { Outlet, useNavigate } from "react-router-dom";
import useAuthContext from "../context/auth/useAuthContext";
import { RoutePaths } from "../routes/RoutePaths";

export default function PublicLayout() {
    const { isLoggedIn } = useAuthContext();
    const navigate = useNavigate();

    if (isLoggedIn) {
        navigate(RoutePaths.DASHBOARD);
    }

    return <Outlet />;
}
