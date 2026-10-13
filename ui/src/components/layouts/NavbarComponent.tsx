import {
    ArrowLeftStartOnRectangleIcon,
    BellAlertIcon,
    ChartBarIcon,
    ClockIcon,
    TicketIcon,
    UserIcon,
    UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import useAuthContext, { RoleType } from "../../context/auth/useAuthContext";
import useToastNotifications from "../../context/toasts/useToastNotifications";
import { RoutePaths } from "../../routes/RoutePaths";
import ActionButton from "../ActionButtonComponent";
import type { IconProps } from "../commons";

type NavbarComponentProps = {
    className?: string;
    handleLoginClick?: () => void;
    handleRegisterClick?: () => void;
};

export default function NavbarComponent({
    className,
    handleLoginClick,
    handleRegisterClick,
}: NavbarComponentProps) {
    const { profile: user, isLoggedIn, logout } = useAuthContext();
    const { clearActiveRide } = useToastNotifications();

    const navigate = useNavigate();

    const navItems: {
        page: string;
        uri: string;
        icon: IconProps;
        roles?: RoleType[];
    }[] = [
        {
            page: "Dashboard",
            uri: RoutePaths.DASHBOARD,
            icon: ChartBarIcon,
        },
        {
            page: "Rides",
            uri: RoutePaths.RIDE_REQUESTS,
            icon: BellAlertIcon,
            roles: [RoleType.DRIVER],
        },
        {
            page: "Booking",
            uri: RoutePaths.BOOKING,
            icon: TicketIcon,
            roles: [RoleType.RIDER, RoleType.ADMIN],
        },
        {
            page: "History",
            uri: RoutePaths.HISTORY,
            icon: ClockIcon,
        },
        {
            page: user.name ?? "Profile",
            uri: RoutePaths.MANAGE,
            icon: UserIcon,
        },
    ];

    return (
        <nav
            className={`flex flex-row justify-center flex-wrap gap-3 ${className}`}
        >
            {isLoggedIn ? (
                <>
                    {navItems.map((item, idx) => {
                        if (item.roles) {
                            if (!item.roles.includes(user.roles[0])) {
                                return;
                            }
                        }

                        return (
                            <ActionButton
                                key={idx}
                                icon={item.icon}
                                text={item.page}
                                onClick={() => navigate(item.uri)}
                                className={`rounded-full text-sm ${location.pathname.startsWith(item.uri) || location.pathname.match(item.uri) ? `primary` : ``}`}
                            />
                        );
                    })}
                    <ActionButton
                        icon={ArrowLeftStartOnRectangleIcon}
                        onClick={() => {
                            clearActiveRide();
                            logout();
                        }}
                        className={`p-1.5 rounded-full text-white bg-rose-600/80 dark:bg-rose-600/40 outline-rose-600/80 dark:outline-rose-600/40`}
                        title="Click to Logout"
                    />
                </>
            ) : (
                <>
                    <ActionButton
                        icon={UserPlusIcon}
                        text={"Login"}
                        onClick={handleLoginClick}
                        className={`rounded-full text-sm`}
                    />
                    <ActionButton
                        icon={UserPlusIcon}
                        text={"Register"}
                        onClick={handleRegisterClick}
                        className={`rounded-full text-sm primary`}
                    />
                </>
            )}
        </nav>
    );
}
