import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import type { LabelElementProps } from "./form-commons";
import type { MarkerComponentProps } from "../map/MarkerComponent";
import MarkerComponent from "../map/MarkerComponent";

export type InputComponentProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "id"
> & {
    id: string;
    label?: LabelElementProps & {
        marker?: MarkerComponentProps;
    };
    customise?: string;
    children?: ReactNode;
    ref?: Ref<HTMLInputElement>;
};

export default function InputComponent({
    id,
    label,
    customise,
    children,
    ref,
    ...props
}: InputComponentProps) {
    return (
        <div className={`${label ? `form-group` : ``} ${customise ?? ""}`}>
            {label &&
                (() => {
                    const { marker, ...labelProps } = label;
                    return (
                        <label
                            {...labelProps}
                            htmlFor={id}
                            className={`space-x-1 ${label.className}`}
                        >
                            {label.icon && <label.icon className="size-4" />}
                            {label.text && <span>{label.text}</span>}
                            {marker && <MarkerComponent {...marker} />}
                        </label>
                    );
                })()}
            <input {...props} id={id} ref={ref} />
            {children || ""}
        </div>
    );
}
