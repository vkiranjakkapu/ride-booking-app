import { useCallback, useEffect, useState } from "react";
import type { ErrorResponse } from "../../../api/api";
import SectionLayoutComponent from "../../../components/layouts/SectionLayoutComponent";
import Notification from "../../../components/notifications/Notification";
import { useNotifications } from "../../../components/notifications/useNotifications";
import RideHistoryCard from "../../../components/rides/RideHistoryCard";
import ReportsService, {
    type DriverDashboardSummary,
    type DriverEarningsReport,
} from "../../../services/ReportsService";
import type { Ride } from "../../../services/RideService";
import BookingsService from "../../../services/BookingsService";
import SummaryCard from "../../../components/SummaryCard";

const EMPTY_SUMMARY: DriverDashboardSummary = {
    totalRides: 0,
    completedRides: 0,
    activeRides: 0,
    totalEarnings: 0,
};

const EMPTY_EARNINGS: DriverEarningsReport = {
    completedRides: 0,
    totalEarnings: 0,
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

function formatCurrency(amount: number | null | undefined): string {
    return currencyFormatter.format(amount ?? 0);
}

export default function DriverDashboard() {
    const [summary, setSummary] =
        useState<DriverDashboardSummary>(EMPTY_SUMMARY);
    const [earnings, setEarnings] =
        useState<DriverEarningsReport>(EMPTY_EARNINGS);
    const [rides, setRides] = useState<Ride[]>([]);
    const [progress, setProgress] = useState(true);

    const { notifications, setNotifications } = useNotifications([
        "driver-dashboard",
    ]);

    const notification = notifications["driver-dashboard"];

    const fetchDashboard = useCallback(() => {
        Promise.all([
            ReportsService.getDriverDashboardSummary(),
            ReportsService.getDriverEarnings(),
            BookingsService.getMyRides<Ride[]>(),
        ])
            .then(([summaryResponse, earningsResponse, ridesResponse]) => {
                setSummary(summaryResponse.data);
                setEarnings(earningsResponse.data);
                setRides(ridesResponse.data ?? []);
            })
            .catch((error: ErrorResponse) => {
                setNotifications("driver-dashboard", {
                    type: "error",
                    messages:
                        error.errorMessage ??
                        "Unable to load the driver dashboard. Please try again.",
                });
            })
            .finally(() => {
                setProgress(false);
            });
    }, [setNotifications]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const recentRides = rides.slice(0, 5);

    return (
        <SectionLayoutComponent
            title="Dashboard"
            description="View your ride activity, earnings, and recent trips."
            spinner={{
                isLoading: progress,
                text: "Preparing your dashboard...",
            }}
        >
            <div className="space-y-6">
                {notification && <Notification {...notification} />}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Rides"
                        value={summary.totalRides.toString()}
                        description="All assigned rides"
                    />

                    <SummaryCard
                        title="Completed Rides"
                        value={summary.completedRides.toString()}
                        description="Successfully completed"
                    />

                    <SummaryCard
                        title="Active Rides"
                        value={summary.activeRides.toString()}
                        description="Currently in progress"
                    />

                    <SummaryCard
                        title="Total Earnings"
                        value={formatCurrency(earnings.totalEarnings)}
                        description={`${earnings.completedRides} completed rides`}
                    />
                </div>

                <section className="rounded-xl border bg-white p-5 shadow-sm dark:bg-dark-primary">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Earnings Summary
                            </h2>
                            <p className="mt-1 text-sm text-current/70">
                                Earnings calculated from completed rides.
                            </p>
                        </div>

                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(earnings.totalEarnings)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg bg-primary/30 p-4 dark:bg-dark-secondary/50">
                            <p className="text-sm text-current/70">
                                Completed Rides
                            </p>
                            <p className="mt-2 text-xl font-semibold">
                                {earnings.completedRides}
                            </p>
                        </div>

                        <div className="rounded-lg bg-primary/30 p-4 dark:bg-dark-secondary/50">
                            <p className="text-sm text-current/70">
                                Average Earnings per Completed Ride
                            </p>
                            <p className="mt-2 text-xl font-semibold">
                                {formatCurrency(
                                    earnings.completedRides > 0
                                        ? earnings.totalEarnings /
                                              earnings.completedRides
                                        : 0,
                                )}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Recent Ride History
                            </h2>
                            <p className="mt-1 text-sm text-current/70">
                                Your five most recent rides.
                            </p>
                        </div>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-current/70 dark:text-current/80 dark:bg-dark-primary">
                            {rides.length} rides
                        </span>
                    </div>

                    {recentRides.length > 0 ? (
                        <div className="space-y-3">
                            {recentRides.map((ride) => (
                                <RideHistoryCard key={ride.id} ride={ride} />
                            ))}
                        </div>
                    ) : (
                        !progress && (
                            <div className="rounded-xl border border-dashed p-8 text-center">
                                <p className="font-medium">
                                    No ride history available
                                </p>
                                <p className="mt-1 text-sm text-current/70">
                                    Your rides will appear here when available.
                                </p>
                            </div>
                        )
                    )}
                </section>
            </div>
        </SectionLayoutComponent>
    );
}
