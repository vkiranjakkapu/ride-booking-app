import { InformationCircleIcon } from "@heroicons/react/16/solid";
import type { ErrorResponse } from "../../../api/api";
import type { NoticeTheme } from "../../../context/toasts/useToastNotifications";
import type { IconProps } from "../../commons";

export type ToastProps = {
    icon?: IconProps;
    type: NoticeTheme;
    message: string | ErrorResponse;
    useBold?: boolean;
};

export default function ToastComponent({
    type,
    message,
    icon: Icon,
    useBold = false,
}: ToastProps) {
    const msg =
        typeof message === "object"
            ? message.validationErrors && message.validationErrors.length > 0
                ? message.validationErrors.map(
                      (ve) => `${ve.field} ${ve.message}`,
                  )
                : message.errorMessage
            : message;

    return (
        <div
            className={`border border-l-3 p-2 rounded flex items-center gap-1 w-[30ch] notification ${type} ${useBold ? "bold" : ""}`}
        >
            {Icon ? (
                <Icon className="size-4" />
            ) : (
                <InformationCircleIcon className="size-4" />
            )}
            <span>{msg}</span>
        </div>
    );
}
