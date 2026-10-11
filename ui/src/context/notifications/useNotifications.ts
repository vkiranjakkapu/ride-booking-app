import { createContext, useContext } from "react";
import type { IconProps } from "../../components/commons";

export type NoticeTheme = "info" | "success" | "warn" | "error";

export type ToastProps = {
    icon?: IconProps;
    type: NoticeTheme;
    message: string;
};

export type RideNotificationProps = {
    icon?: IconProps;
    type?: NoticeTheme;
    message: string;
};

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
