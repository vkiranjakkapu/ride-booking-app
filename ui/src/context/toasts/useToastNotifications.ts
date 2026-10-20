import {
    createContext,
    useContext,
    type Dispatch,
    type SetStateAction,
} from "react";
import type { ActiveRideNotificationProps } from "../../components/ActiveRideNotification";
import type { RideNotificationProps } from "../../components/toasts/components/RideNotificationComponent";
import type { ToastProps } from "../../components/toasts/components/ToastComponent";
import type { Ride } from "../../services/RideService";

export type NoticeTheme = "info" | "success" | "warn" | "error";

export type NotificationContextProps = {
    toasts: ToastProps[];
    addToast: (toast: ToastProps) => void;
    clearToast: (toast: ToastProps) => void;

    rideUpdates: RideNotificationProps[];
    addRideNotification: (toast: RideNotificationProps) => void;

    getActiveRide: Ride | null;
    setActiveRide: Dispatch<SetStateAction<Ride | null>>;

    setActiveRideNotification: (
        activeRide: ActiveRideNotificationProps,
    ) => void;

    clearActiveRideNotification: () => void;
};

export const NotificationContext =
    createContext<NotificationContextProps | null>(null);

export default function useToastNotifications() {
    const context = useContext(NotificationContext);

    if (!context) throw Error("Context was null");

    return context;
}
