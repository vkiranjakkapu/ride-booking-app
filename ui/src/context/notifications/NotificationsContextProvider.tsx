import { useRef, useState, type ReactNode } from "react";
import type { ToastProps } from "../../components/notifications/components/ToastComponent";
import NotificationLayout from "../../components/notifications/NotificationLayout";
import {
    NotificationContext,
    type RideUpdateProps,
} from "./useNotifications";

export type NotificationsContextProviderProps = {
    children: ReactNode;
};

export default function NotificationsContextProvider({
    children,
}: NotificationsContextProviderProps) {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const [rideUpdates, setRideUpdates] = useState<RideUpdateProps[]>([]);

    const rideNotificationsTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const toastsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function addToast(newToast: ToastProps) {
        setToasts((prev) => [newToast, ...prev]);

        const timeoutId = setTimeout(() => {
            setToasts((prev) => prev.slice(0, -1));
        }, 5000);

        toastsTimeoutRef.current = timeoutId;

        return () => {
            clearTimeout(timeoutId);
        };
    }

    function addRideNotification(rideNotification: RideUpdateProps) {
        setRideUpdates((prev) => [rideNotification, ...prev]);

        const timeoutId = setTimeout(() => {
            setRideUpdates((prev) => prev.slice(0, -1));
        }, 5000);

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
                addRideNotification,
            }}
        >
            <NotificationLayout />
            {children}
        </NotificationContext>
    );
}
