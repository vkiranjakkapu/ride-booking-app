import { InformationCircleIcon } from "@heroicons/react/16/solid";
import type { NoticeTheme } from "../../../context/notifications/useNotifications";
import type { IconProps } from "../../commons";

export type RideNotificationProps = {
    icon?: IconProps;
    type?: NoticeTheme;
    message: string;
};

export default function RideNotificationComponent({
    message,
    type,
    icon: Icon,
}: RideNotificationProps) {
    return (
        <div
            className={`border border-l-3 p-2 rounded flex items-center gap-1 w-[60ch] ${
                type == "success"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-700 dark:border-emerald-400"
                    : type == "error"
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-700 dark:border-rose-400"
                      : type == "info"
                        ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-700 dark:border-cyan-400"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-700 dark:border-amber-400"
            }`}
        >
            {Icon ? (
                <Icon className="size-4" />
            ) : (
                <InformationCircleIcon className="size-4" />
            )}
            <span>{message}</span>
        </div>
    );
}
