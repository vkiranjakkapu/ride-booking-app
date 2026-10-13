import { StarIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/24/outline";
import type { HTMLAttributes } from "react";
import ActionButton from "../../components/ActionButtonComponent";
import DividerComponent from "../../components/DividerComponent";
import SectionLayoutComponent from "../../components/layouts/SectionLayoutComponent";
import MarkerComponent from "../../components/map/MarkerComponent";
import { DateFormatter } from "../../utils/DateFormatter";

export default function RideRequestsPage() {
    return (
        <SectionLayoutComponent
            title="Awaiting Pickup"
            description="Accept the ride to start pickup"
        >
            <div className="space-y-3">
                <RideRequestComponent />
                <RideRequestComponent />
                <RideRequestComponent />
            </div>
        </SectionLayoutComponent>
    );
}

type RideRequestComponentProps = HTMLAttributes<HTMLDivElement> & {};

function RideRequestComponent({ ...props }: RideRequestComponentProps) {
    return (
        <div
            {...props}
            className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-md border bg-primary/30 dark:bg-dark-primary *:space-y-0.5 ${props.className}`}
        >
            <div>
                <DividerComponent text="Rider Details" />
                <p>Venkata Kiran J</p>
                <p className="text-sm font-semibold flex items-center gap-0.5">
                    <StarIcon className="size-3" />
                    <span>5</span>
                </p>
            </div>
            <div className="w-full lg:w-[36ch]">
                <p className="text-start">Lorem ipsum dolor sit.</p>
                <div className="flex items-center justify-center">
                    <MarkerComponent className="translate-x-1.5 size-2.5! rounded-[2.5px]" />
                    <div className="p-0.5 bg-primary-accent dark:bg-dark-accent/30 w-full"></div>
                    <MarkerComponent
                        color="rose"
                        weight="400"
                        className="-translate-x-2 size-2.5! rounded-[2.5px]"
                    />
                </div>
                <p className="text-end">Lorem ipsum dolor sit.</p>
            </div>
            <div className="text-sm">
                <DividerComponent text="Fare" />
                <p>₹ 100 /-</p>
            </div>
            <div className="text-sm">
                <DividerComponent text="Order time" />
                <p>{DateFormatter.toFormattedDate(new Date())}</p>
            </div>
            <div className="">
                <DividerComponent
                    text="Accept &nbsp; Decline"
                    className="mb-2"
                />
                <div className="text-sm flex items-center justify-around gap-2">
                    <ActionButton icon={CheckIcon} className="theme-success" />
                    <ActionButton icon={CheckIcon} className="theme-danger" />
                </div>
            </div>
        </div>
    );
}
