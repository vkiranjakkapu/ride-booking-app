import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { HTMLAttributes } from "react";
import type { Ride } from "../../services/RideService";
import { DateFormatter } from "../../utils/DateFormatter";
import { formatDurationTaken } from "../../utils/DurationFormatter";
import ActionButton, { type ActionButtonProps } from "../ActionButtonComponent";
import DividerComponent from "../DividerComponent";
import RouteComponent from "../RouteComponent";

type RideRequestComponentProps = HTMLAttributes<HTMLDivElement> & {
    ride: Ride;
    aceeptButton: Omit<ActionButtonProps, "onClick"> & {
        onClick: (ride: Ride) => void;
    };
    declineButton: Omit<ActionButtonProps, "onClick"> & {
        onClick?: (ride: Ride) => void;
    };
};

export default function RideRequestCard({
    ride,
    aceeptButton,
    declineButton,
    ...props
}: RideRequestComponentProps) {
    return (
        <div
            {...props}
            className={`flex flex-wrap items-center justify-between gap-3 md:gap-4 lg:gap-6 p-3 rounded-md border bg-primary/30 dark:bg-dark-primary *:space-y-0.5 ${props.className}`}
        >
            <RouteComponent
                className="w-full lg:flex-1 order-3"
                pickup={ride.pickupAddress}
                destination={ride.destinationAddress}
            />

            <div className="text-sm order-4">
                <DividerComponent text="Fare" />
                <p>{`₹ ${ride?.estimatedFare}`}</p>
            </div>
            <div className="text-sm order-5">
                <DividerComponent
                    text="ETC"
                    title="Estimated Time to Complete"
                />
                <p>{formatDurationTaken(ride?.estimatedDurationSeconds)}</p>
            </div>
            <div className="text-sm order-6">
                <DividerComponent text="Order time" />
                <p>{DateFormatter.toFormattedDate(ride?.createdAt)}</p>
            </div>
            <div className="flex items-center justify-end gap-2 order-2 md:order-6 flex-1 md:flex-none">
                <div className="text-sm">
                    <DividerComponent text="Accept" className="mb-2" />
                    <ActionButton
                        icon={CheckIcon}
                        className="mx-auto theme-success"
                        {...aceeptButton}
                        onClick={() => {
                            aceeptButton.onClick?.(ride);
                        }}
                    />
                </div>
                <div className="text-sm">
                    <DividerComponent text="Decline" className="mb-2" />
                    <ActionButton
                        icon={XMarkIcon}
                        className="mx-auto theme-danger"
                        {...declineButton}
                        onClick={() => {
                            declineButton.onClick?.(ride);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
