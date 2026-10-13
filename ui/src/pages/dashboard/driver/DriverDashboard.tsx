import { useEffect } from "react";
import type { ActiveRideNotificationProps } from "../../../components/ActiveRideNotification";
import SectionLayoutComponent from "../../../components/layouts/SectionLayoutComponent";
import useToastNotifications from "../../../context/toasts/useToastNotifications";

export default function DriverDashboard() {
    const { setActiveRide } = useToastNotifications();

    useEffect(() => {
        setActiveRide({} as ActiveRideNotificationProps);
    }, [setActiveRide]);

    return (
        <SectionLayoutComponent
            title="Driver Dashboard"
            description="This Page shows your earnings activity so far."
        >
            <div>Driver Dashboard</div>
        </SectionLayoutComponent>
    );
}
