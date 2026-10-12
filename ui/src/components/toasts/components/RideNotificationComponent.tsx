import { InformationCircleIcon } from "@heroicons/react/16/solid";
import type { NoticeTheme } from "../../../context/toasts/useToastNotifications";
import type { IconProps } from "../../commons";

export type RideNotificationProps = {
    icon?: IconProps;
    type?: NoticeTheme;
    message: string;
    useBold?: boolean;
};

export default function RideNotificationComponent({
    message,
    type,
    icon: Icon,
    useBold = false,
}: RideNotificationProps) {
    return (
        <div
            className={`border border-l-3 p-2 rounded flex items-center gap-1 w-[60ch] notification ${type} ${useBold ? "bold" : ""}`}
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
