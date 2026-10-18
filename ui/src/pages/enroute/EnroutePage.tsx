import { XCircleIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ErrorResponse } from "../../api/api";
import ActionButton from "../../components/ActionButtonComponent";
import SectionLayoutComponent from "../../components/layouts/SectionLayoutComponent";
import type { Coordinates, RouteSummary } from "../../components/map/MapDtos";
import RideSummaryComponent from "../../components/map/RideSummaryComponent";
import Notification from "../../components/notifications/Notification";
import { useNotifications } from "../../components/notifications/useNotifications";
import RideHistoryCard from "../../components/rides/RideHistoryCard";
import SpinnerComponent from "../../components/SpinnerComponent";
import { RoutePaths } from "../../routes/RoutePaths";
import RideService, { type Ride } from "../../services/RideService";
import MapComponent from "../booking/MapComponent";

export default function EnroutePage() {
    const { rideId } = useParams<{ rideId: string }>();
    const navigate = useNavigate();

    const { notifications, setNotifications } = useNotifications(["info"]);
    const infoNotifications = notifications["info"];

    const [ride, setRide] = useState<Ride | null>(null);

    const [pickup, setPickup] = useState<Coordinates>();
    const [destination, setDestination] = useState<Coordinates>();

    const [routeSummary, setRouteSummary] = useState<RouteSummary>();

    const [fetchInProgress, setFetchInProgress] = useState<boolean>(true);
    const fetchRideDetails = useCallback(() => {
        if (!rideId) {
            navigate(RoutePaths.DASHBOARD);
            return;
        }
        RideService.getRideById<Ride>(rideId)
            .then((resp) => {
                const ride = resp.data;

                setRide(ride);
                setPickup([ride.pickupLatitude, ride.pickupLongitude]);
                setDestination([
                    ride.destinationLatitude,
                    ride.destinationLongitude,
                ]);
            })
            .catch((e: ErrorResponse) => {
                setNotifications("info", {
                    type: "error",
                    messages: e,
                });
            })
            .finally(() => {
                setFetchInProgress(false);
            });
    }, [rideId, navigate, setNotifications]);

    useEffect(() => {
        fetchRideDetails();

        // return () => {
        //     setActiveRide({
        //         ride,
        //         user: !isRider ? "driver" : "rider",
        //         contactOptions: [
        //             {
        //                 icon: PhoneIcon,
        //                 className: "theme-success",
        //             },
        //         ],
        //         handleCancel(ride) {
        //             console.log(ride);
        //         },
        //     } as ActiveRideNotificationProps);
        // };
    }, [fetchRideDetails]);

    return (
        <SectionLayoutComponent
            title="Ride in progress"
            description="Your Current Ride details were shown below"
            spinner={{
                isLoading: fetchInProgress,
                text: "Getting Ride Details...",
            }}
        >
            {infoNotifications && (
                <div>
                    <Notification {...infoNotifications} />
                </div>
            )}

            <div className="p-1 flex flex-col lg:flex-row flex-wrap gap-3 *:rounded">
                <div className="flex-1 flex flex-col gap-3 order-2 lg:order-1 *:dark:border-dark-accent/20">
                    {routeSummary ? (
                        <>
                            <div className="flex flex-wrap justify-end gap-3">
                                <div className="flex-1">
                                    <ActionButton
                                        text="Cancel Ride"
                                        icon={XCircleIcon}
                                        className="theme-danger justify-center w-full"
                                    />
                                </div>
                            </div>
                            <RideSummaryComponent
                                ride={ride ?? undefined}
                                summary={routeSummary}
                                className="*:p-3"
                                showDirections={true}
                            />
                        </>
                    ) : (
                        <SpinnerComponent text="getting route" />
                    )}
                </div>

                <div className="lg:w-4/6 order-1 lg:order-2 space-y-3">
                    <RideHistoryCard ride={ride!} hideDetails />
                    <MapComponent
                        className="border h-110! rounded-md"
                        pickup={pickup!}
                        destination={destination}
                        onRouteFound={(summary) => {
                            setRouteSummary(summary);
                        }}
                    />
                </div>
            </div>
        </SectionLayoutComponent>
    );
}
