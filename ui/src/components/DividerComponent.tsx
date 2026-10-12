import type { HTMLAttributes } from "react";
import type { IconProps } from "./commons";

type DividerComponentProps = HTMLAttributes<HTMLDivElement> & {
    text: string;
    icon?: IconProps;
    iconAfter?: boolean;
};

export default function DividerComponent({
    text,
    icon: Icon,
    iconAfter = false,
    ...props
}: DividerComponentProps) {
    return (
        <div
            {...props}
            className={`uppercase text-xs font-semibold flex items-center gap-1.5 tracking-wider ${props.className}`}
        >
            {!iconAfter && Icon && <Icon className="size-4" />}
            <span>{text}</span>
            {iconAfter && Icon && <Icon className="size-4" />}
        </div>
    );
}
