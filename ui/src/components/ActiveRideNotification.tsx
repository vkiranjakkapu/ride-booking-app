import { XMarkIcon } from "@heroicons/react/24/outline";
import type { HTMLAttributes } from "react";
import type { Ride } from "../services/RideService";
import type { ActionButtonProps } from "./ActionButtonComponent";
import ActionButton from "./ActionButtonComponent";
import DividerComponent from "./DividerComponent";
import RouteComponent from "./RouteComponent";

export type ActiveRideNotificationProps = HTMLAttributes<HTMLDivElement> & {
    ride: Ride;
    user: "rider" | "driver";
    contactOptions: ActionButtonProps[];
    handleCancel?: (ride: Ride) => void;
};

export default function ActiveRideNotificationComponent({
    ride,
    user,
    contactOptions,
    handleCancel,
    ...props
}: ActiveRideNotificationProps) {
    return (
        <div
            {...props}
            className={`flex flex-wrap items-center justify-between gap-4 flex-1 ${props.className}`}
        >
            <div className="space-y-1">
                <DividerComponent text="Rider details" />
                <p>{user === "driver" ? ride.driverName : ride.riderName}</p>
            </div>
            <div className="flex items-center gap-1.5">
                {contactOptions?.map((btn, idx) => (
                    <ActionButton
                        key={idx}
                        {...btn}
                        className={`primary p-2 rounded-full ${btn.className}`}
                    />
                ))}
                {handleCancel && (
                    <ActionButton
                        icon={XMarkIcon}
                        className="theme-danger sm:hidden p-2 rounded-full"
                        title="Cancel Ride"
                        onClick={() => handleCancel(ride)}
                    />
                )}
            </div>
            <RouteComponent
                className="w-full sm:flex-1"
                pickup={ride.pickupAddress}
                destination={ride.destinationAddress}
            />
            {handleCancel && (
                <div className="hidden sm:flex items-center justify-center flex-1 sm:flex-none gap-1.5">
                    <ActionButton
                        icon={XMarkIcon}
                        className="theme-danger p-2 rounded-full"
                        title="Cancel Ride"
                        onClick={() => handleCancel(ride)}
                    />
                </div>
            )}
        </div>
    );
}
