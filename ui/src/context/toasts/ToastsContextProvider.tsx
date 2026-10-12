import { useRef, useState, type ReactNode } from "react";
import type { RideNotificationProps } from "../../components/toasts/components/RideNotificationComponent";
import type { ToastProps } from "../../components/toasts/components/ToastComponent";
import NotificationLayout from "../../components/toasts/ToastsNotificationLayout";
import { NotificationContext } from "./useToastNotifications";

export type NotificationsContextProviderProps = {
    children: ReactNode;
};

export default function ToastsContextProvider({
    children,
}: NotificationsContextProviderProps) {
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const [rideUpdates, setRideUpdates] = useState<RideNotificationProps[]>([]);

    const autoCloseTime = 5000;
    const rideNotificationsTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);
    const toastsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function addToast(newToast: ToastProps) {
        setToasts((prev) => [newToast, ...prev]);

        const timeoutId = setTimeout(() => {
            setToasts((prev) => prev.slice(0, -1));
        }, autoCloseTime);

        toastsTimeoutRef.current = timeoutId;

        return () => {
            clearTimeout(timeoutId);
        };
    }

    function clearToast(toast: ToastProps) {
        setToasts((prev) => prev.filter((tst) => tst != toast));
    }

    function addRideNotification(rideNotification: RideNotificationProps) {
        setRideUpdates((prev) => [rideNotification, ...prev]);

        const timeoutId = setTimeout(() => {
            setRideUpdates((prev) => prev.slice(0, -1));
        }, autoCloseTime);

        rideNotificationsTimeoutRef.current = timeoutId;

        return () => {
            clearTimeout(timeoutId);
        };
    }

    return (
        <NotificationContext
            value={{
                toasts,
                rideUpdates,
                addToast,
                clearToast,
                addRideNotification,
            }}
        >
            <NotificationLayout />
            {children}
        </NotificationContext>
    );
}
