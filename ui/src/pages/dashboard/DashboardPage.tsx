import useAuthContext from "../../context/auth/useAuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import DriverDashboard from "./driver/DriverDashboard";
import RiderDashboard from "./rider/RiderDashboard";

export default function DashboardPage() {
    const { isAdmin, isDriver } = useAuthContext();

    return isAdmin ? (
        <AdminDashboard />
    ) : isDriver ? (
        <DriverDashboard />
    ) : (
        <RiderDashboard />
    );
}
