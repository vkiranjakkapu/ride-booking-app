import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ErrorResponse } from "../../api/api";
import SectionLayoutComponent from "../../components/layouts/SectionLayoutComponent";
import Notification from "../../components/notifications/Notification";
import { useNotifications } from "../../components/notifications/useNotifications";
import RideRequestCard from "../../components/rides/RideRequestCard";
import useToastNotifications from "../../context/toasts/useToastNotifications";
import { RoutePaths } from "../../routes/RoutePaths";
import type { Ride } from "../../services/RideService";
import RideService, { RideStatus } from "../../services/RideService";
import useRideUpdates, {
    type ErrorResponseWithTheme,
} from "../../services/useRideUpdates";

export default function RideRequestsPage() {
    const navigate = useNavigate();

    const {
        getActiveRide,
        setActiveRide,
        setActiveRideNotification,
        addToast,
    } = useToastNotifications();

    const { notifications, setNotifications } = useNotifications(["info"]);
    const infoNotifications = notifications["info"];

    const [availableRides, setAvailableRides] = useState<Ride[]>([]);

    const [ridesFetchInProgress, setRidesFetchInProgress] = useState<boolean>(
        () => {
            return getActiveRide ? false : true;
        },
    );
    const fetchAvailableRides = useCallback(() => {
        RideService.getAvailableRideRequests<Ride[]>()
            .then((resp) => {
                setAvailableRides(resp.data);
            })
            .finally(() => {
                setRidesFetchInProgress(false);
            });
    }, []);

    useEffect(() => {
        if (getActiveRide) {
            setNotifications(
                "info",
                {
                    type: "warn",
                    messages:
                        "You can't accept other rides, while one in progress.",
                },
                true,
            );
            return;
        }

        fetchAvailableRides();
    }, [getActiveRide, fetchAvailableRides, setNotifications]);

    const rideUpdates = useCallback(
        (frame: IMessage) => {
            const newRide = JSON.parse(frame.body) as Ride;

            if (
                ![RideStatus.REQUESTED, RideStatus.CANCELLED].includes(
                    newRide.status,
                )
            )
                return;

            if (newRide.status === RideStatus.REQUESTED && !getActiveRide) {
                setAvailableRides((prev) => [newRide, ...prev]);
                return;
            }

            setAvailableRides((prev) =>
                prev.filter((rd) => rd.id !== newRide.id),
            );
        },
        [getActiveRide],
    );

    useRideUpdates(rideUpdates, true, (e: ErrorResponseWithTheme) => {
        addToast({
            type: e.theme ?? "warn",
            message: e,
        });
    });

    const [actionProgress, setActionProgress] = useState<
        "accept" | "decline" | null
    >(null);
    const handleAccept = (ride: Ride) => {
        setActionProgress("accept");
        RideService.acceptRide<Ride>(ride.id)
            .then((resp) => {
                setActiveRide(resp.data);
                setActiveRideNotification({
                    showDetailsOf: "rider",
                    ride: resp.data,
                });
                navigate(RoutePaths.ENROUTE.replace(":rideId", ride.id));
            })
            .catch((e: ErrorResponse) => {
                setNotifications("info", {
                    type: "error",
                    messages: e,
                });
            })
            .finally(() => {
                setActionProgress(null);
            });
    };

    const handleDecline = (ride: Ride) => {
        setActionProgress("decline");
        RideService.declineRequest(ride.id)
            .then(() => {
                setAvailableRides((prev) =>
                    prev.filter((rd) => rd.id != ride.id),
                );
            })
            .catch((e: ErrorResponse) => {
                setNotifications("info", {
                    type: "error",
                    messages: e,
                });
            })
            .finally(() => {
                setActionProgress(null);
            });
    };

    return (
        <SectionLayoutComponent
            title="Awaiting Pickup"
            description="Accept the ride to start pickup"
            spinner={{
                isLoading: ridesFetchInProgress,
                text: "Fetching available ride requests...",
            }}
            actionButtons={
                getActiveRide
                    ? [
                          {
                              icon: ArrowTopRightOnSquareIcon,
                              text: "Active Ride",
                              className: "primary",
                              onClick() {
                                  navigate(
                                      RoutePaths.ENROUTE.replace(
                                          ":rideId",
                                          getActiveRide.id,
                                      ),
                                  );
                              },
                          },
                      ]
                    : undefined
            }
        >
            <div className="space-y-3">
                {infoNotifications && <Notification {...infoNotifications} />}

                {availableRides.length > 0
                    ? availableRides.map((ride) => (
                          <RideRequestCard
                              key={ride.id}
                              ride={ride}
                              aceeptButton={{
                                  spinner: {
                                      isLoading: actionProgress === "accept",
                                  },
                                  onClick(ride) {
                                      handleAccept(ride);
                                  },
                              }}
                              declineButton={{
                                  spinner: {
                                      isLoading: actionProgress === "decline",
                                  },
                                  onClick(ride) {
                                      handleDecline(ride);
                                  },
                              }}
                          />
                      ))
                    : !getActiveRide && (
                          <Notification
                              messages={"No ride requests at this moment."}
                          />
                      )}
            </div>
        </SectionLayoutComponent>
    );
}
