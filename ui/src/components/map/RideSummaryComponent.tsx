import type { HTMLAttributes } from "react";
import DividerComponent from "../../components/DividerComponent";
import { formatDistance } from "../../utils/DistanceFormatters";
import { formatDurationTaken } from "../../utils/DurationFormatter";
import type { RouteSummary } from "./MapDtos";

type RideSummaryComponentProps = HTMLAttributes<HTMLDivElement> & {
    summary: RouteSummary;
    showDirections?: boolean;
};

export default function RideSummaryComponent({
    summary,
    showDirections = false,
    ...props
}: RideSummaryComponentProps) {
    return (
        <div
            {...props}
            className={`space-y-3 *:dark:bg-dark-primary/40 ${props.className}`}
        >
            <div className="space-y-2 rounded border">
                <DividerComponent text="Ride Details" />
                <hr />
                <p className="capitalize">
                    <b className="uppercase text-xs">Distance : </b>
                    {summary?.distance}
                </p>
                <p className="capitalize">
                    <b className="uppercase text-xs">Estimated Time : </b>
                    {summary?.duration}
                </p>
            </div>
            {showDirections && summary.instructions.length > 0 && (
                <div className="space-y-2 rounded border">
                    <DividerComponent text="Directions" />
                    <hr />

                    <ol className="space-y-3">
                        {summary.instructions.map((instruction, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-dark-secondary dark:bg-dark-accent text-sm font-semibold text-primary dark:text-dark-secondary">
                                    {index + 1}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p>{instruction.text}</p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {formatDistance(instruction.distance)} ·{" "}
                                        {formatDurationTaken(instruction.time)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
