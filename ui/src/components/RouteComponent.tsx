import type { HTMLAttributes } from "react";
import MarkerComponent from "./map/MarkerComponent";

type RouteComponentProps = HTMLAttributes<HTMLDivElement> & {};

export default function RouteComponent({ ...props }: RouteComponentProps) {
    return (
        <div {...props} className={`${props.className}`}>
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
    );
}
