import type { HTMLAttributes } from "react";

export type MarkerComponentProps = HTMLAttributes<HTMLDivElement> & {
    color?: string;
    weight?: string;
};

export default function MarkerComponent({
    color,
    weight,
    ...props
}: MarkerComponentProps) {
    return (
        <div
            {...props}
            className={`size-3 rounded outline-2 outline-${color ?? "emerald"}-${weight ?? 600} outline-offset-2 m-1
            bg-${color ?? "emerald"}-${weight ?? 600} shadow-lg ${props.className}`}
        ></div>
    );
}
