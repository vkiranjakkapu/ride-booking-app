import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";

export type NotificationProps = {
    type: "success" | "error" | "info";
    messages: string[];
    hideIcon?: boolean;
    customise?: string;
};

export default function Notification({
    type,
    messages,
    hideIcon = false,
    customise,
}: NotificationProps) {
    return (
        <>
            {messages.length > 0 && (
                <div
                    className={`p-2.5 col-span-full flex flex-row gap-2 items-center dark:text-white text-sm rounded-lg notification ${type} ${customise ?? ""}`}
                >
                    {!hideIcon &&
                        (type == "error" ? (
                            <ExclamationCircleIcon
                                className={`text-rose-500 size-4`}
                            />
                        ) : type == "info" ? (
                            <InformationCircleIcon className="text-cyan-600 size-4" />
                        ) : (
                            <CheckCircleIcon className="text-emerald-500 size-4" />
                        ))}
                    <span>{messages.join(", ")}</span>
                </div>
            )}
        </>
    );
}
