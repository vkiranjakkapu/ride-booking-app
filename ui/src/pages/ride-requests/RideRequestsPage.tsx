import {
    ChatBubbleLeftRightIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ActiveRideNotificationProps } from "../../components/ActiveRideNotification";
import SectionLayoutComponent from "../../components/layouts/SectionLayoutComponent";
import Notification from "../../components/notifications/Notification";
import RideRequestCard from "../../components/rides/RideRequestCard";
import useToastNotifications from "../../context/toasts/useToastNotifications";
import { RoutePaths } from "../../routes/RoutePaths";
import type { Ride } from "../../services/RideService";
import RideService from "../../services/RideService";

export default function RideRequestsPage() {
    const navigate = useNavigate();
    const { setActiveRide } = useToastNotifications();

    const [availableRides, setAvailableRides] = useState<Ride[]>([]);

    const fetchAvailableRides = useCallback((ride: Ride) => {
        setAvailableRides((prev) => [...prev, ride]);
    }, []);

    useEffect(() => {
        // fetchAvailableRides();
    }, [fetchAvailableRides]);

    const handleAccept = (ride: Ride) => {
        RideService.acceptRide<Ride>(ride.id)
            .then((resp) => {
                setActiveRide({
                    user: "rider",
                    ride: resp.data,
                    contactOptions: [
                        {
                            icon: PhoneIcon,
                            className: "theme-success",
                        },
                        {
                            icon: ChatBubbleLeftRightIcon,
                            className: "primary",
                        },
                    ],
                } as ActiveRideNotificationProps);
            })
            .finally(() => {
                navigate(RoutePaths.ENROUTE.replace(":rideId", ride.id));
            });
    };

    const handleDecline = (ride: Ride) => {
        RideService.declineRequest(ride.id).then(() => {
            setAvailableRides((prev) => prev.filter((rd) => rd.id != ride.id));
        });
    };

    return (
        <SectionLayoutComponent
            title="Awaiting Pickup"
            description="Accept the ride to start pickup"
        >
            {availableRides.length > 0 ? (
                availableRides.map((ride) => (
                    <div className="space-y-3">
                        <RideRequestCard
                            key={ride.id}
                            ride={ride}
                            handleAccept={handleAccept}
                            handleDecline={handleDecline}
                        />
                    </div>
                ))
            ) : (
                <Notification messages={"No ride requests at this moment."} />
            )}
        </SectionLayoutComponent>
    );
}
