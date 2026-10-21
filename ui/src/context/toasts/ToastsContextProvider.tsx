import type { IMessage } from "@stomp/stompjs";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { ErrorResponse } from "../../api/api";
import { type ActiveRideNotificationProps } from "../../components/ActiveRideNotification";
import type { RideNotificationProps } from "../../components/toasts/components/RideNotificationComponent";
import type { ToastProps } from "../../components/toasts/components/ToastComponent";
import NotificationLayout from "../../components/toasts/ToastsNotificationLayout";
import type { Ride } from "../../services/RideService";
import RideService, { RideStatus } from "../../services/RideService";
import useRideUpdates from "../../services/useRideUpdates";
import useAuthContext from "../auth/useAuthContext";
import { NotificationContext } from "./useToastNotifications";

export type NotificationsContextProviderProps = {
    children: ReactNode;
};

export default function ToastsContextProvider({
    children,
}: NotificationsContextProviderProps) {
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const [rideUpdates, setRideUpdates] = useState<RideNotificationProps[]>([]);
    const [activeRide, setActiveRide] = useState<Ride | null>(null);

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

    const clearActiveRideNotification = useCallback(() => {
        setRideUpdates((prev) =>
            prev.filter((rd) => rd.activeRide === undefined),
        );
    }, []);

    const setActiveRideNotification = useCallback(
        (activeRide: ActiveRideNotificationProps) => {
            clearActiveRideNotification();
            addRideNotification({ activeRide });
        },
        [clearActiveRideNotification],
    );

    const { isLoggedIn, isDriver } = useAuthContext();

    const wsRideUpdates = useCallback(
        (frame: IMessage) => {
            const ride = JSON.parse(frame.body) as Ride;

            if (ride.status === RideStatus.COMPLETED) {
                setActiveRide(null);
                clearActiveRideNotification();
                return;
            }

            setActiveRide(ride);
            setActiveRideNotification({
                ride,
                showDetailsOf: isDriver ? "rider" : "driver",
            });
        },
        [isDriver, setActiveRideNotification, clearActiveRideNotification],
    );

    useRideUpdates(
        wsRideUpdates,
        false,
        useCallback((e) => {
            addToast({
                type: e.theme || "warn",
                message: e.errorMessage || "Live updates connection error.",
            });
        }, []),
    );

    useEffect(() => {
        if (!isLoggedIn) {
            queueMicrotask(() => {
                setActiveRide(null);
                clearActiveRideNotification();
            });
            return;
        }

        RideService.getActiveRide<Ride>()
            .then((resp) => {
                if (resp.status === 204) {
                    return;
                }

                setActiveRide(resp.data);
                setActiveRideNotification({
                    ride: resp.data,
                    showDetailsOf: isDriver ? "rider" : "driver",
                });
            })
            .catch((e: ErrorResponse) => {
                console.log(e);
                addToast({
                    type: e.errorCode === "503" ? "warn" : "info",
                    message:
                        e.errorCode === "503"
                            ? "We are facing unexpected issues. Please go to history page to access your rides, after a while."
                            : "Please find your ride details in history page.",
                });
            });
    }, [
        isLoggedIn,
        isDriver,
        setActiveRideNotification,
        clearActiveRideNotification,
    ]);

    return (
        <NotificationContext
            value={{
                toasts,
                rideUpdates,
                addToast,
                clearToast,
                addRideNotification,
                setActiveRideNotification,
                getActiveRide: activeRide,
                setActiveRide,
                clearActiveRideNotification,
            }}
        >
            <NotificationLayout />
            {children}
        </NotificationContext>
    );
}
