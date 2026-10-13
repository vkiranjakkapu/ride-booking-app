import { useRef, useState, type ReactNode } from "react";
import type { ActiveRideNotificationProps } from "../../components/ActiveRideNotification";
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

    const toastTimeoutRefs = useRef<
        Map<ToastProps, ReturnType<typeof setTimeout>>
    >(new Map());
    const rideNotificationsTimeoutRef = useRef<
        Map<RideNotificationProps, ReturnType<typeof setTimeout>>
    >(new Map());

    function addToast(newToast: ToastProps) {
        setToasts((prev) => [newToast, ...prev]);

        const timeoutId = setTimeout(() => {
            setToasts((prev) => prev.filter((tst) => tst !== newToast));
            toastTimeoutRefs.current.delete(newToast);
        }, autoCloseTime);

        toastTimeoutRefs.current.set(newToast, timeoutId);

        return () => {
            clearTimeout(timeoutId);
            toastTimeoutRefs.current.delete(newToast);
        };
    }

    function clearToast(toast: ToastProps) {
        setToasts((prev) => prev.filter((tst) => tst !== toast));

        const timeoutId = toastTimeoutRefs.current.get(toast);
        if (timeoutId) {
            clearTimeout(timeoutId);
            toastTimeoutRefs.current.delete(toast);
        }
    }

    function addRideNotification(rideNotification: RideNotificationProps) {
        setRideUpdates((prev) => [rideNotification, ...prev]);

        if (
            rideNotification.autoClose === false ||
            rideNotification.activeRide !== undefined
        )
            return;

        const timeoutId = setTimeout(() => {
            setRideUpdates((prev) =>
                prev.filter((n) => n !== rideNotification),
            );
            rideNotificationsTimeoutRef.current.delete(rideNotification);
        }, autoCloseTime);

        rideNotificationsTimeoutRef.current.set(rideNotification, timeoutId);

        return () => {
            clearTimeout(timeoutId);
            rideNotificationsTimeoutRef.current.delete(rideNotification);
        };
    }

    function setActiveRide(activeRide: ActiveRideNotificationProps) {
        setRideUpdates((prev) => [
            { activeRide } as RideNotificationProps,
            ...prev.filter((rdn) => rdn.activeRide === undefined),
        ]);
    }

    function clearActiveRide() {
        setRideUpdates((prev) =>
            prev.filter((rdn) => rdn.activeRide === undefined),
        );
    }

    return (
        <NotificationContext
            value={{
                toasts,
                rideUpdates,
                addToast,
                clearToast,
                addRideNotification,
                setActiveRide,
                clearActiveRide,
            }}
        >
            <NotificationLayout />
            {children}
        </NotificationContext>
    );
}
