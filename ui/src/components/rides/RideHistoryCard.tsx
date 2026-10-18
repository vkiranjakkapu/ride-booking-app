import {
    ArrowTopRightOnSquareIcon,
    BanknotesIcon,
    ClockIcon,
    MapPinIcon,
} from "@heroicons/react/24/outline";
import type { HTMLAttributes, ReactNode } from "react";
import { RideStatus, type Ride } from "../../services/RideService";
import { DateFormatter } from "../../utils/DateFormatter";
import { formatDistance } from "../../utils/DistanceFormatters";
import { formatDurationTaken } from "../../utils/DurationFormatter";
import ActionButton from "../ActionButtonComponent";
import DividerComponent from "../DividerComponent";
import MarkerComponent from "../map/MarkerComponent";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "../../routes/RoutePaths";

type RideHistoryCardProps = HTMLAttributes<HTMLDivElement> & {
    ride: Ride;
    actions?: ReactNode;
    hideDetails?: boolean;
};

export default function RideHistoryCard({
    ride,
    actions,
    hideDetails = false,
    ...props
}: RideHistoryCardProps) {
    const navigate = useNavigate();

    const fare = ride.finalFare ?? ride.estimatedFare;
    return (
        <article
            {...props}
            className={`rounded-lg border bg-primary/20 p-4 dark:bg-dark-primary space-y-4 ${props.className}`}
        >
            {!hideDetails && (
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div>
                            <DividerComponent text="Ride status" />
                            <p className="font-semibold">
                                {ride.status.replaceAll("_", " ")}
                            </p>
                        </div>
                        {ride.status === RideStatus.REQUESTED && (
                            <ActionButton
                                className="primary group rounded-full p-2 text-sm"
                                title="Open Ride Details"
                                icon={ArrowTopRightOnSquareIcon}
                                onClick={() => {
                                    navigate(
                                        RoutePaths.ENROUTE.replace(
                                            ":rideId",
                                            ride.id,
                                        ),
                                    );
                                }}
                            />
                        )}
                    </div>
                    <p className="font-semibold">₹{Number(fare).toFixed(2)}</p>
                </div>
            )}
            <div className="space-y-3">
                <div className="flex flex-wrap items-start gap-2">
                    <MarkerComponent
                        color="emerald"
                        className="size-1.5! rounded-[1.5px]"
                    />
                    <div>
                        <DividerComponent
                            text="Pickup"
                            className="font-normal! capitalize!"
                        />
                        <p>{ride.pickupAddress}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                    <MarkerComponent
                        color="rose"
                        weight="400"
                        className="size-1.5! rounded-[1.5px]"
                    />
                    <div>
                        <DividerComponent
                            text="Destination"
                            className="font-normal! capitalize!"
                        />
                        <p>{ride.destinationAddress}</p>
                    </div>
                </div>
            </div>
            {!hideDetails && (
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm opacity-80">
                    <span className="inline-flex items-center gap-1">
                        <MapPinIcon className="size-4" />
                        {formatDistance(ride.distanceMeters)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <ClockIcon className="size-4" />
                        {formatDurationTaken(ride.estimatedDurationSeconds)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <BanknotesIcon className="size-4" />
                        {DateFormatter.toFormattedDate(
                            new Date(ride.createdAt),
                        )}
                    </span>
                </div>
            )}
            {actions && (
                <div className="flex flex-wrap gap-2 border-t pt-3">
                    {actions}
                </div>
            )}
        </article>
    );
}
