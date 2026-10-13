import { InformationCircleIcon } from "@heroicons/react/16/solid";
import type { HTMLAttributes } from "react";
import type { NoticeTheme } from "../../../context/toasts/useToastNotifications";
import type { ActiveRideNotificationProps } from "../../ActiveRideNotification";
import type { IconProps } from "../../commons";
import ActiveRideNotificationComponent from "../../ActiveRideNotification";

export type RideNotificationProps = HTMLAttributes<HTMLDivElement> & {
    icon?: IconProps;
    type?: NoticeTheme;
    message?: string;
    useBold?: boolean;
    useTheme?: boolean;
    autoClose?: boolean;

    activeRide?: ActiveRideNotificationProps;
};

export default function RideNotificationComponent({
    message,
    type,
    icon: Icon,
    useTheme = false,
    useBold = false,
    activeRide,
    ...props
}: RideNotificationProps) {
    return (
        <div
            {...props}
            className={`border p-2 rounded-full flex items-center gap-1 w-[60ch] notification ride-notification ${type} ${useTheme || activeRide !== undefined ? `theme` : ""} ${useBold ? "bold" : ""} ${props.className ?? ""}`}
        >
            {!activeRide ? (
                <>
                    {Icon ? (
                        <Icon className="size-4" />
                    ) : (
                        <InformationCircleIcon className="size-4" />
                    )}
                    {message && <span>{message}</span>}
                </>
            ) : (
                <ActiveRideNotificationComponent {...activeRide} />
            )}
        </div>
    );
}
