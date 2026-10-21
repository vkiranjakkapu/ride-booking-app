import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import type { ErrorResponse } from "../../../api/api";
import { type BadgeProps } from "../../../components/BadgeComponent";
import SectionLayoutComponent from "../../../components/layouts/SectionLayoutComponent";
import Notification from "../../../components/notifications/Notification";
import { useNotifications } from "../../../components/notifications/useNotifications";
import SummaryCard from "../../../components/SummaryCard";
import TableComponent from "../../../components/TableComponent";
import type { UserProfile } from "../../../context/auth/useAuthContext";
import BookingsService from "../../../services/BookingsService";
import ReportsService, {
    type AdminDashboardSummary,
} from "../../../services/ReportsService";
import type { Ride } from "../../../services/RideService";
import { DateFormatter } from "../../../utils/DateFormatter";

const EMPTY_SUMMARY: AdminDashboardSummary = {
    totalUsers: 0,
    totalDrivers: 0,
    totalRides: 0,
    completedRides: 0,
    activeRides: 0,
    totalRevenue: 0,
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

function formatCurrency(value: number | null | undefined): string {
    return currencyFormatter.format(value ?? 0);
}

export default function AdminDashboard() {
    const [summary, setSummary] =
        useState<AdminDashboardSummary>(EMPTY_SUMMARY);

    const { notifications, setNotifications } = useNotifications([
        "dashboard-fetch",
    ]);
    const infoNotifications = notifications["dashboard-fetch"];

    const [rides, setRides] = useState<Ride[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const [refreshKey, setRefreshKey] = useState(0);

    const loadDashboard = useCallback(async () => {
        Promise.all([
            ReportsService.getAdminDashboardSummary(),
            BookingsService.getMyRides<Ride[]>(),
            ReportsService.getAdminUsers(),
        ])
            .then(([summaryResponse, ridesResponse, usersResponse]) => {
                setSummary(summaryResponse.data);
                setRides(ridesResponse.data ?? []);
                setUsers(
                    (usersResponse.data ?? []).map((user) => ({
                        ...user,
                        name: `${user.firstName} ${user.lastName}`,
                    })),
                );
            })
            .catch((error) => {
                const apiError = error as Partial<ErrorResponse>;
                console.log(apiError);

                setNotifications("dashboard-fetch", {
                    type: "error",
                    messages:
                        "Unable to load the admin dashboard. Please try again.",
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [setNotifications]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard, refreshKey]);

    const recentRides = rides.slice(0, 10);
    const recentUsers = users.slice(0, 10);

    return (
        <SectionLayoutComponent
            title="Admin Dashboard"
            description="Monitor users, drivers, rides, and ride-fare totals."
            actionButtons={[
                {
                    icon: ArrowPathIcon,
                    text: "Refresh",
                    className: "primary text-sm",
                    onClick() {
                        setLoading(true);
                        setRefreshKey((key) => key + 1);
                    },
                    spinner: { isLoading: loading },
                    disabled: loading,
                },
            ]}
        >
            <div className="space-y-3">
                {infoNotifications && <Notification {...infoNotifications} />}

                <section
                    aria-label="System summary"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <SummaryCard
                        title="Total Users"
                        value={summary.totalUsers.toLocaleString("en-IN")}
                        description="Registered users"
                        spinner={{
                            isLoading: loading,
                        }}
                    />

                    <SummaryCard
                        title="Total Drivers"
                        value={summary.totalDrivers.toLocaleString("en-IN")}
                        description="Registered drivers"
                        spinner={{
                            isLoading: loading,
                        }}
                    />

                    <SummaryCard
                        title="Total Rides"
                        value={summary.totalRides.toLocaleString("en-IN")}
                        description="All recorded rides"
                        spinner={{
                            isLoading: loading,
                        }}
                    />

                    <SummaryCard
                        title="Completed Rides"
                        value={summary.completedRides.toLocaleString("en-IN")}
                        description="Successfully completed"
                        spinner={{
                            isLoading: loading,
                        }}
                    />

                    <SummaryCard
                        title="Active Rides"
                        value={summary.activeRides.toLocaleString("en-IN")}
                        description="Accepted or in progress"
                        spinner={{
                            isLoading: loading,
                        }}
                    />

                    <SummaryCard
                        title="Completed Rides Fare Total"
                        value={formatCurrency(summary.totalRevenue)}
                        valueClassName="text-emerald-600"
                        description="Completed rides' final fares; not verified payment revenue"
                        spinner={{
                            isLoading: loading,
                        }}
                    />
                </section>

                <TableComponent
                    title="Recent Rides"
                    description="The ten most recent rides."
                    className="border rounded-xl dark:bg-dark-primary"
                    spinner={{
                        isLoading: loading,
                        text: "Fetching Rides...",
                    }}
                    body={recentRides}
                    columns={[
                        { key: "id", alias: "ride id" },
                        { key: "riderName", alias: "rider" },
                        { key: "driverName", alias: "driver" },
                        {
                            key: "status",
                            renderColumn(val) {
                                return {
                                    value: val,
                                } as BadgeProps;
                            },
                        },
                        {
                            key: "finalFare",
                            renderColumn(val) {
                                return `₹ ${val}`;
                            },
                        },
                        {
                            key: "createdAt",
                            renderColumn(val) {
                                return DateFormatter.toFormattedDate(
                                    String(val),
                                );
                            },
                            props: (val) => {
                                return {
                                    title: DateFormatter.toFormattedDate(
                                        String(val),
                                    ),
                                };
                            },
                        },
                    ]}
                />

                <TableComponent
                    title="Users and Drivers"
                    description="The ten most recent users."
                    className="border rounded-xl dark:bg-dark-primary"
                    spinner={{
                        isLoading: loading,
                        text: "Fetching Users...",
                    }}
                    body={recentUsers}
                    columns={[
                        { key: "name", alias: "user" },
                        { key: "email" },
                        {
                            key: "phone",
                            renderColumn(val) {
                                return !val ? "—" : val;
                            },
                        },
                        {
                            key: "roles",
                            renderColumn(val) {
                                return Array.from(val as string[]).join(", ");
                            },
                        },
                    ]}
                />
            </div>
        </SectionLayoutComponent>
    );
}
