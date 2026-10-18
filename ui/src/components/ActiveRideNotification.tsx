import {
    ChatBubbleLeftRightIcon,
    PhoneIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import type { HTMLAttributes } from "react";
import type { ActionButtonProps } from "./ActionButtonComponent";
import ActionButton from "./ActionButtonComponent";
import DividerComponent from "./DividerComponent";
import type { RouteSummary } from "./map/MapDtos";
import RouteComponent from "./RouteComponent";

export type ActiveRideNotificationProps = HTMLAttributes<HTMLDivElement> & {
    userDetails?: unknown;
    rideDetails?: RouteSummary;
    contactOptions?: ActionButtonProps[];
    handleCancel?: (ride: unknown) => void;
};

export default function ActiveRideNotificationComponent({
    userDetails,
    rideDetails,
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
                <p>Venkata Kiran J</p>
            </div>
            <div className="flex items-center gap-1.5">
                {contactOptions?.map((btn, idx) => (
                    <ActionButton key={idx} {...btn} className={`primary p-2 rounded-full ${btn.className}`} />
                ))}
                <ActionButton
                    icon={ChatBubbleLeftRightIcon}
                    className="primary p-2 rounded-full"
                />
                <ActionButton
                    icon={PhoneIcon}
                    className="theme-success p-2 rounded-full"
                />
                <ActionButton
                    icon={XMarkIcon}
                    className="theme-danger sm:hidden p-2 rounded-full"
                    title="Cancel Ride"
                />
            </div>
            <RouteComponent className="w-full sm:flex-1" />
            <div className="hidden sm:flex items-center justify-center flex-1 sm:flex-none gap-1.5">
                <ActionButton
                    icon={XMarkIcon}
                    className="theme-danger p-2 rounded-full"
                    title="Cancel Ride"
                    onClick={handleCancel}
                />
            </div>
        </div>
    );
}
