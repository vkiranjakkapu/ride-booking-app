import { useCallback, useEffect, useState } from "react";
import SectionLayoutComponent from "../../components/layouts/SectionLayoutComponent";
import RideHistoryCard from "../../components/rides/RideHistoryCard";
import type { Ride } from "../../services/RideService";
import BookingsService from "../../services/BookingsService";
import type { ErrorResponse } from "../../api/api";
import { useNotifications } from "../../components/notifications/useNotifications";
import usePagination from "../../components/pagination/usePagination";
import Notification from "../../components/notifications/Notification";

export default function HistoryPage() {
    const [history, setHistory] = useState<Ride[]>([]);

    const { notifications, setNotifications } = useNotifications(["history"]);
    const notification = notifications["history"];

    const [progress, setProgress] = useState<boolean>(true);
    const fetchHistory = useCallback(() => {
        BookingsService.getMyRides<Ride[]>()
            .then((resp) => {
                setHistory(resp.data);
            })
            .catch((e: ErrorResponse) => {
                if (e.errorCode === "503") {
                    setNotifications("history", {
                        type: "warn",
                        messages:
                            "We are facing unexpected issues, please try again later.",
                    });
                    return;
                }

                setNotifications("history", {
                    type: "error",
                    messages: e.errorMessage,
                });
            })
            .finally(() => {
                setProgress(false);
            });
    }, [setNotifications]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const pagination = usePagination(history);

    return (
        <SectionLayoutComponent
            title="Ride History"
            description="Your ride history will be displayed here."
            pagination={pagination}
            spinner={{ isLoading: progress, text: "Fetching ride history..." }}
        >
            {notification && (
                <div>
                    <Notification {...notification} />
                </div>
            )}
            <div className="space-y-3">
                {pagination.currentItems.length > 0 ? (
                    pagination.currentItems.map((ride) => (
                        <RideHistoryCard key={ride.id} ride={ride} />
                    ))
                ) : (
                    <Notification type="info" messages={"No ride history."} />
                )}
            </div>
        </SectionLayoutComponent>
    );
}
