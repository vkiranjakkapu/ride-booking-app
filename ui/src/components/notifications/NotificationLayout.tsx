import { createPortal } from "react-dom";
import useNotifications from "../../context/notifications/useNotifications";
import RideNotificationComponent from "./components/RideNotificationComponent";
import ToastComponent from "./components/ToastComponent";

export default function NotificationLayout() {
    const { toasts, rideUpdates } = useNotifications();

    const layout = (
        <div className="z-50 absolute inset-0 m-6 pointer-events-none">
            {/* Toasts */}
            {toasts.length > 0 && (
                <div className="absolute top-0 right-0 space-y-3">
                    {toasts.map((toast, idx) => (
                        <ToastComponent key={idx} {...toast} />
                    ))}
                </div>
            )}

            {/* RideNotifications */}
            {rideUpdates.length > 0 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 space-y-3">
                    {rideUpdates.map((notice, idx) => (
                        <RideNotificationComponent key={idx} {...notice} />
                    ))}
                </div>
            )}
        </div>
    );

    return createPortal(layout, document.body);
}
