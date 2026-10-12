import { createContext, useContext } from "react";
import type { RideNotificationProps } from "../../components/notifications/components/RideNotificationComponent";
import type { ToastProps } from "../../components/notifications/components/ToastComponent";

export type NoticeTheme = "info" | "success" | "warn" | "error";

export type NotificationContextProps = {
    toasts: ToastProps[];
    addToast: (toast: ToastProps) => void;

    rideUpdates: RideNotificationProps[];
    addRideNotification: (toast: RideNotificationProps) => void;
};

export const NotificationContext =
    createContext<NotificationContextProps | null>(null);

export default function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) throw Error("Context was null");

    return context;
}
