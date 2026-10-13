import { createContext, useContext } from "react";
import type { RideNotificationProps } from "../../components/toasts/components/RideNotificationComponent";
import type { ToastProps } from "../../components/toasts/components/ToastComponent";

export type NoticeTheme = "info" | "success" | "warn" | "error";

export type NotificationContextProps = {
    toasts: ToastProps[];
    addToast: (toast: ToastProps) => void;
    clearToast: (toast: ToastProps) => void;

    rideUpdates: RideNotificationProps[];
    addRideNotification: (toast: RideNotificationProps) => void;
    setActiveRide: (activeRide: RideNotificationProps) => void;
    clearActiveRide: () => void;
};

export const NotificationContext =
    createContext<NotificationContextProps | null>(null);

export default function useToastNotifications() {
    const context = useContext(NotificationContext);

    if (!context) throw Error("Context was null");

    return context;
}
