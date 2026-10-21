import { StarIcon } from "@heroicons/react/16/solid";
import {
    ArrowPathIcon,
    BanknotesIcon,
    CheckBadgeIcon,
    InformationCircleIcon,
    PhoneIcon,
    UserIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";
import type { IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ErrorResponse } from "../../api/api";
import ActionButton from "../../components/ActionButtonComponent";
import DividerComponent from "../../components/DividerComponent";
import InputComponent from "../../components/formelements/InputComponent";
import SectionLayoutComponent from "../../components/layouts/SectionLayoutComponent";
import type { Coordinates, RouteSummary } from "../../components/map/MapDtos";
import RideSummaryComponent from "../../components/map/RideSummaryComponent";
import Notification from "../../components/notifications/Notification";
import { useNotifications } from "../../components/notifications/useNotifications";
import RideHistoryCard from "../../components/rides/RideHistoryCard";
import SpinnerComponent from "../../components/SpinnerComponent";
import useAuthContext from "../../context/auth/useAuthContext";
import useToastNotifications from "../../context/toasts/useToastNotifications";
import { RoutePaths } from "../../routes/RoutePaths";
import RideService, { RideStatus, type Ride } from "../../services/RideService";
import useRideUpdates, {
    type ErrorResponseWithTheme,
} from "../../services/useRideUpdates";
import MapComponent from "../booking/MapComponent";

type EnroutePageProps = {
    title?: string;
    description?: string;
};

export default function EnroutePage({ title, description }: EnroutePageProps) {
    const { rideId } = useParams<{ rideId: string }>();

    const navigate = useNavigate();

    const { isDriver } = useAuthContext();

    const { notifications, setNotifications } = useNotifications([
        "info",
        "ride",
        "otp",
    ]);
    const infoNotifications = notifications["info"];
    const rideNotifications = notifications["ride"];
    const otpNotifications = notifications["otp"];

    const [ride, setRide] = useState<Ride | null>(null);
    const [pickup, setPickup] = useState<Coordinates | null>(null);
    const [destination, setDestination] = useState<Coordinates | null>(null);

    const [routeSummary, setRouteSummary] = useState<RouteSummary>();
    const handleRouteFound = useCallback((summary: RouteSummary) => {
        setRouteSummary(summary);
    }, []);

    const {
        getActiveRide,
        setActiveRide,

        setActiveRideNotification,
        clearActiveRideNotification,

        addRideNotification,
        addToast,
    } = useToastNotifications();

    const activeRideRef = useRef<Ride | null>(null);

    const [rideOtp, setRideOtp] = useState<number | null>(null);
    const [otpFetchProgress, setOtpFetchProgress] = useState<boolean>(false);
    const getRideOtp = useCallback(
        (rideId: string) => {
            if (isDriver) return;

            setOtpFetchProgress(true);
            RideService.getRideOtp(rideId)
                .then((resp) => {
                    setRideOtp(resp.data);
                })
                .catch((e: ErrorResponse) => {
                    console.log(e);

                    setNotifications("otp", {
                        type: "error",
                        messages: "Error getting OTP",
                    });
                })
                .finally(() => {
                    setOtpFetchProgress(false);
                });
        },
        [isDriver, setNotifications],
    );

    const [fetchInProgress, setFetchInProgress] = useState<boolean>(true);
    const fetchRideDetails = useCallback(() => {
        if (activeRideRef.current) {
            const currentActive = activeRideRef.current;

            setRide(currentActive);
            setPickup([
                currentActive.pickupLatitude,
                currentActive.pickupLongitude,
            ]);
            setDestination([
                currentActive.destinationLatitude,
                currentActive.destinationLongitude,
            ]);
            setFetchInProgress(false);
            getRideOtp(currentActive.id);
            return;
        }

        RideService.getRideById<Ride>(rideId!)
            .then((resp) => {
                const ride = resp.data;

                if (ride.status === RideStatus.COMPLETED) {
                    navigate(
                        isDriver
                            ? RoutePaths.RIDE_REQUESTS
                            : RoutePaths.HISTORY,
                    );
                    return;
                }

                getRideOtp(resp.data.id);

                setRide(ride);
                setPickup([ride.pickupLatitude, ride.pickupLongitude]);
                setDestination([
                    ride.destinationLatitude,
                    ride.destinationLongitude,
                ]);
            })
            .catch((e: ErrorResponse) => {
                if (e.errorCode === "BUS-0002") {
                    navigate(RoutePaths.DASHBOARD);
                    return;
                }

                setNotifications("info", {
                    type: "error",
                    messages: e,
                });
            })
            .finally(() => {
                setFetchInProgress(false);
            });
    }, [rideId, isDriver, getRideOtp, navigate, setNotifications]);

    useEffect(() => {
        if (getActiveRide) {
            if (!rideId || getActiveRide.id === rideId) {
                activeRideRef.current = getActiveRide;

                if (activeRideRef.current.status === RideStatus.COMPLETED) {
                    navigate(
                        isDriver
                            ? RoutePaths.RIDE_REQUESTS
                            : RoutePaths.HISTORY,
                    );
                    return;
                }
            }
        } else if (!rideId) {
            queueMicrotask(() => {
                setFetchInProgress(false);
            });
            navigate(RoutePaths.DASHBOARD);
            return;
        }

        fetchRideDetails();
    }, [rideId, isDriver, getActiveRide, fetchRideDetails, navigate]);

    useEffect(() => {
        clearActiveRideNotification();
        return () => {
            if (!ride) {
                return;
            }

            setActiveRideNotification({
                ride: ride,
                showDetailsOf: isDriver ? "rider" : "driver",
            });
        };
    }, [
        clearActiveRideNotification,

        ride,

        setActiveRideNotification,
        isDriver,
    ]);

    const [actionProgress, setActionProgress] = useState<
        "cancel" | "start" | "complete" | "payment" | null
    >(null);
    const cancelRide = () => {
        if (
            !window.confirm(`Are you sure cancelling this ride? OK to confirm.`)
        ) {
            return;
        }

        setActionProgress("cancel");
        RideService.cancelRide<Ride>((rideId ?? ride?.id)!)
            .then(() => {
                setRide(null);
                activeRideRef.current = null;
                setActiveRide(null);
                clearActiveRideNotification();
                navigate(RoutePaths.HISTORY);
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

    const otpInputRef = useRef<HTMLInputElement | null>(null);

    const startRide = () => {
        if (!otpInputRef.current) {
            return;
        }

        const otp = otpInputRef.current.value;
        if (!otp.trim()) {
            setNotifications("ride", {
                type: "error",
                messages: "OTP is required to start the ride.",
            });
            return;
        }

        setActionProgress("start");
        RideService.startRide<Ride>((rideId ?? ride?.id)!, otp)
            .then((resp) => {
                const startedRide = resp.data;
                setRide(startedRide);
                activeRideRef.current = startedRide;
                setActiveRide(startedRide);
            })
            .catch((e: ErrorResponse) => {
                setNotifications("ride", {
                    type: "error",
                    messages: e,
                });
            })
            .finally(() => {
                setActionProgress(null);
            });
    };

    const handleCallClick = (phoneNumber: string) => {
        window.location.assign(`tel:${phoneNumber}`);
    };

    const completeRide = () => {
        setActionProgress("complete");
        RideService.completeRide<Ride>((ride?.id || rideId)!)
            .then(() => {
                setRide(null);
                clearActiveRideNotification();
                setActiveRide(null);
                activeRideRef.current = null;

                setNotifications(
                    "info",
                    {
                        type: "success",
                        messages: "Ride completed successfully",
                    },
                    30,
                );
                const timeout = setTimeout(() => {
                    navigate(
                        !isDriver
                            ? RoutePaths.HISTORY
                            : RoutePaths.RIDE_REQUESTS,
                    );
                }, 30 * 1000);

                return () => {
                    clearTimeout(timeout);
                };
            })
            .catch((e: ErrorResponse) => {
                console.log(e);

                setNotifications("info", {
                    type: "error",
                    messages:
                        "Error completing the ride. Please contact support team.",
                });
            })
            .finally(() => {
                setActionProgress(null);
            });
    };

    const payRideFare = () => {
        if (!window.confirm(`You are about to pay for this ride. Confirm?`)) {
            return;
        }

        setActionProgress("payment");
        RideService.payRideFare<Ride>((ride?.id || rideId)!)
            .then((resp) => {
                setRide(resp.data);
                setActiveRide(resp.data);
                activeRideRef.current = resp.data;

                setNotifications("info", {
                    type: "success",
                    messages: "Payment successful.",
                });
            })
            .catch((e: ErrorResponse) => {
                console.log(e);

                setNotifications("info", {
                    type: "error",
                    messages:
                        "There was an error updating payment info. Please contact support team.",
                });
            })
            .finally(() => {
                setActionProgress(null);
            });
    };

    const rideUpdates = useCallback(
        (frame: IMessage) => {
            try {
                const updatedRide = JSON.parse(frame.body) as Ride;

                const currentRideId = rideId ?? activeRideRef.current?.id;

                if (!currentRideId || updatedRide.id !== currentRideId) {
                    return;
                }

                let message;
                switch (updatedRide.status) {
                    case RideStatus.ACCEPTED:
                        message =
                            "Captain on their way to your pickup location.";
                        break;
                    case RideStatus.IN_PROGRESS:
                        message = "The ride has been begun.";
                        break;
                    case RideStatus.PAID:
                        message = "Payment completed successfully.";
                        break;
                    case RideStatus.COMPLETED:
                        message = "You ride has been completed successfully.";
                        break;

                    default:
                        break;
                }

                addRideNotification({
                    type: "success",
                    message,
                });

                if (updatedRide.status === RideStatus.COMPLETED) {
                    setRide(null);
                    clearActiveRideNotification();
                    setActiveRide(null);
                    activeRideRef.current = null;

                    navigate(
                        isDriver
                            ? RoutePaths.RIDE_REQUESTS
                            : RoutePaths.HISTORY,
                    );
                    return;
                }

                setRide(updatedRide);
                activeRideRef.current = updatedRide;
                setActiveRide(updatedRide);
            } catch (error) {
                console.error("Failed to process ride update:", error);
            }
        },
        [
            rideId,
            isDriver,
            setActiveRide,
            addRideNotification,
            clearActiveRideNotification,
            navigate,
        ],
    );

    const connectionErrors = useCallback(
        (e: ErrorResponseWithTheme) => {
            addToast({
                type: e.theme ?? "error",
                message: e.errorMessage,
            });
        },
        [addToast],
    );
    useRideUpdates(rideUpdates, false, connectionErrors);

    return (
        <SectionLayoutComponent
            title={ride ? "Ride in progress" : (title ?? "Ride Details")}
            description={
                ride
                    ? "Your Current Ride details were shown below"
                    : (description ??
                      "Active ride details will be shown in here")
            }
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

            {ride ? (
                <div className="p-1 flex flex-col lg:flex-row flex-wrap gap-3 *:rounded">
                    <div className="flex-1 flex flex-col gap-3 order-2 lg:order-1 *:dark:border-dark-accent/20">
                        {(() => {
                            return isDriver ? (
                                ride.status === RideStatus.ACCEPTED && (
                                    <div className="space-y-3 *:p-2 *:rounded-md *:border *:bg-primary/40 *:dark:bg-dark-primary/40 *:space-y-2">
                                        <div className="p-2 rounded-md border bg-primary/40 dark:bg-dark-primary/40 space-y-2">
                                            <DividerComponent text="Messages" />
                                            <hr className="border-t" />
                                            <p className="italic text-sm">
                                                "{ride.riderName} is waiting at
                                                the pickup location."
                                            </p>
                                        </div>
                                        <div>
                                            <DividerComponent text="Rider Details" />
                                            <hr className="border-t" />
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="flex-1">
                                                    <p>{ride.riderName}</p>
                                                    <p className="text-sm flex items-center gap-0.5">
                                                        <StarIcon className="size-3" />
                                                        <span>5</span>
                                                    </p>
                                                </div>
                                                <div className="flex-1">
                                                    <ActionButton
                                                        icon={PhoneIcon}
                                                        className="ml-auto theme-success p-2 rounded-full"
                                                        onClick={() =>
                                                            handleCallClick(
                                                                ride.riderPhone!,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : ride.status === RideStatus.ACCEPTED ||
                              ride.status === RideStatus.IN_PROGRESS ? (
                                <div className="space-y-3 *:p-2 *:rounded-md *:border *:bg-primary/40 *:dark:bg-dark-primary/40 *:space-y-2">
                                    <div>
                                        <DividerComponent
                                            text="Messages"
                                            pingAnimation
                                        />
                                        <hr className="border-t" />
                                        <p className="italic text-sm">
                                            "
                                            {ride.status === RideStatus.ACCEPTED
                                                ? "Driver on their way to your pickup location."
                                                : "Please pay the captain to enable him to complete the ride."}
                                            "
                                        </p>
                                    </div>
                                    <div>
                                        <DividerComponent text="Driver Details" />
                                        <hr className="border-t" />
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="flex-1">
                                                <p>
                                                    {ride.driverName}
                                                    <span className="text-sm ml-1 inline-flex items-center gap-0.5">
                                                        (
                                                        <StarIcon className="size-3" />
                                                        <span>5</span>)
                                                    </span>
                                                </p>
                                                <p className="text-sm">
                                                    {ride.vehicleNumber}
                                                </p>
                                            </div>
                                            <div className="flex-1">
                                                <ActionButton
                                                    icon={PhoneIcon}
                                                    className="ml-auto theme-success p-2 rounded-full"
                                                    onClick={() =>
                                                        handleCallClick(
                                                            ride.driverPhone!,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                ride.status === RideStatus.REQUESTED && (
                                    <div className="p-2 rounded-md border bg-primary/40 dark:bg-dark-primary/40 space-y-2">
                                        <DividerComponent text="Ride Status" />
                                        <hr className="border-t" />
                                        <div className="flex items-center gap-2">
                                            <div className="relative size-8 m-1 flex items-center justify-center">
                                                <div className="absolute size-8 animate-ping rounded-full bg-primary-accent/50 dark:bg-dark-accent/50" />
                                                <div className="absolute top-1/2 left-1/2 -translate-1/2">
                                                    <SpinnerComponent size="pointer-events-none size-8" />
                                                </div>
                                                <UserIcon className="size-4" />
                                            </div>
                                            <p className="italic text-sm animate-pulse">
                                                "Finding the best captain for
                                                you..."
                                            </p>
                                        </div>
                                    </div>
                                )
                            );
                        })()}
                        {rideNotifications && (
                            <Notification {...rideNotifications} />
                        )}

                        {/* OTP Field & Cancel Button */}
                        <div className="flex flex-wrap justify-end gap-3">
                            {isDriver && ride.status === RideStatus.ACCEPTED ? (
                                <div className="flex-1 space-y-2 bg-theme bg-primary/40 dark:bg-dark-primary/40 p-2 rounded-md border">
                                    <DividerComponent text="Enter OTP" />
                                    <InputComponent
                                        id="otp"
                                        placeholder="Ride OTP"
                                        className="light"
                                        ref={otpInputRef}
                                    />
                                    <ActionButton
                                        text="Start Ride"
                                        icon={CheckBadgeIcon}
                                        className="theme-success justify-center w-full"
                                        spinner={{
                                            isLoading:
                                                actionProgress === "start",
                                        }}
                                        onClick={startRide}
                                        disabled={actionProgress === "start"}
                                    />
                                </div>
                            ) : (
                                <>
                                    {ride.status === RideStatus.REQUESTED && (
                                        <div className="flex-1">
                                            <ActionButton
                                                text="Cancel Ride"
                                                icon={XCircleIcon}
                                                className="theme-danger justify-center w-full"
                                                spinner={{
                                                    isLoading:
                                                        actionProgress ===
                                                        "cancel",
                                                }}
                                                onClick={cancelRide}
                                                disabled={
                                                    actionProgress === "cancel"
                                                }
                                            />
                                        </div>
                                    )}
                                    {ride.status === RideStatus.ACCEPTED && (
                                        <div className="w-full bg-theme p-2 rounded-md border">
                                            {rideOtp && (
                                                <div className="flex flex-col gap-2 justify-center">
                                                    <div className="flex flex-wrap justify-between items-center">
                                                        <div>
                                                            <DividerComponent text="Ride OTP" />
                                                            <span className="italic text-xs flex items-center gap-0.5">
                                                                <InformationCircleIcon className="size-3" />
                                                                <span className="lowercase">
                                                                    Do not share
                                                                    your OTP
                                                                    before
                                                                    pickup
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <ActionButton
                                                            icon={ArrowPathIcon}
                                                            className="primary"
                                                            onClick={() => {
                                                                getRideOtp(
                                                                    ride.id,
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                    <hr className="border-t" />
                                                    {otpNotifications && (
                                                        <Notification
                                                            {...otpNotifications}
                                                        />
                                                    )}
                                                    {otpFetchProgress ? (
                                                        <SpinnerComponent text="Fetching your ride OTP" />
                                                    ) : (
                                                        <div className="flex justify-center gap-2 p-1">
                                                            {(() => {
                                                                return rideOtp
                                                                    .toString()
                                                                    .split("")
                                                                    .map(
                                                                        (
                                                                            dgt,
                                                                            index,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex items-center justify-center size-8 rounded-md font-bold bg-primary dark:bg-dark-primary"
                                                                            >
                                                                                {
                                                                                    dgt
                                                                                }
                                                                            </span>
                                                                        ),
                                                                    );
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* Complete Ride */}
                                    {isDriver &&
                                        [
                                            RideStatus.IN_PROGRESS,
                                            RideStatus.PAID,
                                        ].includes(ride.status) && (
                                            <div className="flex-1">
                                                <ActionButton
                                                    className="primary justify-center w-full"
                                                    text="Complete Ride"
                                                    icon={CheckBadgeIcon}
                                                    onClick={completeRide}
                                                    disabled={
                                                        !(
                                                            ride.status ===
                                                            RideStatus.PAID
                                                        )
                                                    }
                                                />
                                                {ride.status !==
                                                    RideStatus.PAID && (
                                                    <p className="mt-1 text-amber-500 flex gap-0.5 items-center">
                                                        <InformationCircleIcon className="size-3" />
                                                        <span className="text-sm">
                                                            Rider have{" "}
                                                            <b className="uppercase">
                                                                not paid
                                                            </b>{" "}
                                                            the money{" "}
                                                            <b className="uppercase">
                                                                YET
                                                            </b>
                                                            .
                                                        </span>
                                                    </p>
                                                )}
                                                {ride.status ===
                                                    RideStatus.PAID && (
                                                    <p className="mt-1 text-emerald-600 flex gap-0.5 items-center">
                                                        <InformationCircleIcon className="size-4" />
                                                        <span className="text-sm">
                                                            Payment Completed.
                                                            You can complete the
                                                            ride now.
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                </>
                            )}
                        </div>

                        {/* Ride Summary */}
                        {routeSummary ? (
                            <RideSummaryComponent
                                ride={ride ?? undefined}
                                summary={routeSummary}
                                className="*:p-3"
                                showDirections={
                                    isDriver &&
                                    ride.status === RideStatus.IN_PROGRESS
                                }
                            />
                        ) : (
                            <SpinnerComponent text="getting route" />
                        )}

                        {/* Pay Button */}
                        {!isDriver &&
                            (ride.status === RideStatus.IN_PROGRESS ||
                                ride.status === RideStatus.PAID) && (
                                <div>
                                    <ActionButton
                                        className={`${ride.status === RideStatus.IN_PROGRESS ? "primary" : "theme-success"} w-full justify-center`}
                                        text={
                                            ride.status ===
                                            RideStatus.IN_PROGRESS
                                                ? "Pay Now"
                                                : "Payment Completed."
                                        }
                                        icon={
                                            ride.status ===
                                            RideStatus.IN_PROGRESS
                                                ? BanknotesIcon
                                                : CheckBadgeIcon
                                        }
                                        onClick={payRideFare}
                                        disabled={
                                            ride.status === RideStatus.PAID
                                        }
                                    />
                                    {ride.status === RideStatus.PAID && (
                                        <p className="text-sm text-emerald-600 flex items-center gap-1">
                                            <InformationCircleIcon className="size-3" />
                                            <span>
                                                Captain should complete the ride
                                                now.
                                            </span>
                                        </p>
                                    )}
                                </div>
                            )}
                    </div>

                    <div className="lg:w-4/6 order-1 lg:order-2 space-y-3">
                        {ride && <RideHistoryCard ride={ride} hideDetails />}
                        <MapComponent
                            className="border h-110! rounded-md *:rounded-md"
                            pickup={pickup!}
                            destination={destination ?? undefined}
                            onRouteFound={handleRouteFound}
                        />
                    </div>
                </div>
            ) : (
                <Notification
                    type="info"
                    messages={"You are not in any ride right now."}
                />
            )}
        </SectionLayoutComponent>
    );
}
