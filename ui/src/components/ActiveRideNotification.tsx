import { UserIcon } from "@heroicons/react/16/solid";
import {
    ArrowTopRightOnSquareIcon,
    BanknotesIcon,
    PhoneIcon,
    UserCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState, type HTMLAttributes } from "react";
import { useNavigate } from "react-router-dom";
import type { ErrorResponse } from "../api/api";
import useAuthContext from "../context/auth/useAuthContext";
import useToastNotifications from "../context/toasts/useToastNotifications";
import { RoutePaths } from "../routes/RoutePaths";
import type { Ride } from "../services/RideService";
import RideService, { RideStatus } from "../services/RideService";
import type { ActionButtonProps } from "./ActionButtonComponent";
import ActionButton from "./ActionButtonComponent";
import DividerComponent from "./DividerComponent";
import RouteComponent from "./RouteComponent";
import SpinnerComponent from "./SpinnerComponent";

export type ActiveRideNotificationProps = HTMLAttributes<HTMLDivElement> & {
    ride: Ride;
    showDetailsOf: "rider" | "driver";
    contactOptions?: ActionButtonProps[];
    hideCancelButton?: boolean;
    handleCancelButtonClick?: (ride: Ride) => void;
    handleOpenRideClick?: (ride: Ride) => void;
};

export default function ActiveRideNotificationComponent({
    ride,
    showDetailsOf: selectedUser,
    contactOptions,
    hideCancelButton = false,
    handleCancelButtonClick,
    handleOpenRideClick,
    ...props
}: ActiveRideNotificationProps) {
    const { isDriver, isRider } = useAuthContext();

    const { addToast, clearActiveRideNotification: clearActiveRide } =
        useToastNotifications();
    const navigate = useNavigate();

    if (ride.status !== RideStatus.REQUESTED || isDriver) {
        hideCancelButton = true;
    }

    const handleCallClick = () => {
        const phoneNumber =
            selectedUser === "driver" ? ride.driverPhone : ride.riderPhone;

        if (!phoneNumber) {
            addToast({
                type: "error",
                message: "Phone number is not available.",
            });
            return;
        }

        window.location.href = `tel:${phoneNumber}`;
    };

    const openRideDetails = () => {
        if (handleOpenRideClick) {
            handleOpenRideClick(ride);
            return;
        }

        navigate(
            (isRider ? RoutePaths.RIDER_DASHBOARD : RoutePaths.ENROUTE).replace(
                ":rideId",
                ride.id,
            ),
        );
    };

    const [cancelInProgress, setCancelInProgress] = useState<boolean>(false);
    const cancelRide = () => {
        if (hideCancelButton) {
            return;
        }

        if (!window.confirm(`Are you sure cancelling the ride?`)) {
            return;
        }

        if (handleCancelButtonClick) {
            handleCancelButtonClick(ride);
            return;
        }

        setCancelInProgress(true);
        RideService.cancelRide<Ride>(ride.id)
            .then(() => {
                clearActiveRide();
                addToast({
                    type: "success",
                    message: "Ride Cancelled Successfully",
                });
            })
            .catch((e: ErrorResponse) => {
                addToast({
                    type: "error",
                    message: e,
                });
            })
            .finally(() => {
                setCancelInProgress(false);
            });
    };

    return (
        <div
            {...props}
            className={`flex flex-wrap items-center justify-between gap-4 flex-1 ${props.className}`}
        >
            {ride.status === RideStatus.REQUESTED ? (
                <>
                    <div className="relative size-14 m-1 flex items-center justify-center">
                        <div className="absolute size-14 animate-ping rounded-full bg-primary-accent/50 dark:bg-dark-accent/50" />
                        <div className="absolute top-1/2 left-1/2 -translate-1/2">
                            <SpinnerComponent size="pointer-events-none size-14" />
                        </div>
                        <UserIcon className="size-8" />
                    </div>
                    <div className="space-y-1">
                        <DividerComponent text="Searching Drivers..." />
                        <p>
                            <span className="font-semibold uppercase text-xs">
                                Fare:
                            </span>
                            {` ₹ ${ride.estimatedFare}`}
                        </p>
                    </div>
                    <ActionButton
                        icon={ArrowTopRightOnSquareIcon}
                        className="primary p-2 rounded-full"
                        title="Open Ride Page"
                        onClick={openRideDetails}
                    />
                </>
            ) : (
                <>
                    <div className="flex flex-col gap-2 items-center mx-auto md:mx-0 w-auto md:w-1/4">
                        <DividerComponent
                            text={`${selectedUser} details`}
                            icon={UserCircleIcon}
                        />
                        <p className="text-center">
                            {(selectedUser === "driver"
                                ? ride.driverName
                                : ride.riderName) ?? "..."}
                            {selectedUser === "driver" &&
                                ride.vehicleNumber && (
                                    <span className="block text-sm">
                                        {ride.vehicleNumber}
                                    </span>
                                )}
                        </p>
                        {[
                            RideStatus.ACCEPTED,
                            RideStatus.IN_PROGRESS,
                            RideStatus.PAID,
                        ].includes(ride.status) && (
                            <DividerComponent
                                text={ride.status.replace("_", " ")}
                                pingAnimation
                            />
                        )}
                        {(() => {
                            return ride.status === RideStatus.ACCEPTED ? (
                                <div className="mx-auto p-2 flex items-center justify-between rounded-md border bg-primary/40 dark:bg-dark-primary italic text-sm text-center">
                                    <div className="my-auto bg-primary-accent rounded-full p-1 animate-ping"></div>
                                    "
                                    {isDriver
                                        ? `${ride.riderName} is waiting at their pickup location.`
                                        : `Driver on their way to your pickup location.`}
                                    "
                                </div>
                            ) : (
                                <div className="flex-1 w-full flex justify-center gap-0.5 p-2 text-center rounded-md border bg-primary/40 dark:bg-dark-primary">
                                    <DividerComponent
                                        text="Fare : "
                                        icon={BanknotesIcon}
                                        className="justify-center"
                                    />
                                    <span>₹ {ride.estimatedFare}</span>
                                </div>
                            );
                        })()}
                    </div>
                    <div className="flex items-center mx-auto md:mx-0 gap-1.5">
                        {contactOptions?.map((btn, idx) => (
                            <ActionButton
                                key={idx}
                                {...btn}
                                className={`primary p-2 rounded-full ${btn.className}`}
                            />
                        ))}

                        <ActionButton
                            icon={PhoneIcon}
                            className="theme-success p-2 rounded-full"
                            title="Open Ride Page"
                            onClick={handleCallClick}
                        />
                        <ActionButton
                            icon={ArrowTopRightOnSquareIcon}
                            className="primary p-2 rounded-full"
                            title="Open Ride Page"
                            onClick={openRideDetails}
                        />

                        {!hideCancelButton && (
                            <ActionButton
                                icon={XMarkIcon}
                                className="theme-danger sm:hidden p-2 rounded-full"
                                title="Cancel Ride"
                                spinner={{
                                    isLoading: cancelInProgress,
                                }}
                                onClick={cancelRide}
                                disabled={cancelInProgress}
                            />
                        )}
                    </div>
                </>
            )}
            <RouteComponent
                className="w-full md:flex-1"
                pickup={ride.pickupAddress}
                destination={ride.destinationAddress}
            />
            {!hideCancelButton && (
                <div className="hidden sm:flex items-center justify-center flex-1 sm:flex-none gap-1.5">
                    <ActionButton
                        icon={XMarkIcon}
                        className="theme-danger p-2 rounded-full"
                        title="Cancel Ride"
                        spinner={{
                            isLoading: cancelInProgress,
                        }}
                        onClick={cancelRide}
                        disabled={cancelInProgress}
                    />
                </div>
            )}
        </div>
    );
}
