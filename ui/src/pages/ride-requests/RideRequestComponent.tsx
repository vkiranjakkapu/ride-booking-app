import { StarIcon } from "@heroicons/react/16/solid";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { HTMLAttributes } from "react";
import ActionButton from "../../components/ActionButtonComponent";
import DividerComponent from "../../components/DividerComponent";
import RouteComponent from "../../components/RouteComponent";
import { DateFormatter } from "../../utils/DateFormatter";
import { formatDurationTaken } from "../../utils/DurationFormatter";

type RideRequestComponentProps = HTMLAttributes<HTMLDivElement> & {};

export default function RideRequestComponent({
    ...props
}: RideRequestComponentProps) {
    return (
        <div
            {...props}
            className={`flex flex-wrap items-center justify-between gap-3 md:gap-4 lg:gap-6 p-3 rounded-md border bg-primary/30 dark:bg-dark-primary *:space-y-0.5 ${props.className}`}
        >
            <div className="order-1">
                <DividerComponent text="Rider Details" />
                <p>Venkata Kiran J</p>
                <p className="text-sm font-semibold flex items-center gap-0.5">
                    <StarIcon className="size-3" />
                    <span>5</span>
                </p>
            </div>

            <RouteComponent className="w-full lg:w-[36ch] order-3" />

            <div className="text-sm order-4">
                <DividerComponent text="Fare" />
                <p>₹ 100 /-</p>
            </div>
            <div className="text-sm order-5">
                <DividerComponent
                    text="ETC"
                    title="Estimated Time to Complete"
                />
                <p>{formatDurationTaken(209)}</p>
            </div>
            <div className="text-sm order-6">
                <DividerComponent text="Order time" />
                <p>{DateFormatter.toFormattedDate(new Date())}</p>
            </div>
            <div className="flex items-center justify-end gap-2 order-2 md:order-6 flex-1 md:flex-none">
                <div className="text-sm">
                    <DividerComponent text="Accept" className="mb-2" />
                    <ActionButton
                        icon={CheckIcon}
                        className="mx-auto theme-success"
                    />
                </div>
                <div className="text-sm">
                    <DividerComponent text="Decline" className="mb-2" />
                    <ActionButton
                        icon={XMarkIcon}
                        className="mx-auto theme-danger"
                    />
                </div>
            </div>
        </div>
    );
}
