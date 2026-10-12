import type { InputHTMLAttributes } from "react";
import type { LabelElementProps } from "./form-commons";

export type InputComponentProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "id"
> & {
    id: string;
    label?: LabelElementProps;
    customise?: string;
};

export default function InputComponent({
    id,
    label,
    customise,
    ...props
}: InputComponentProps) {
    return (
        <div className={`${label ? `form-group` : ``} ${customise ?? ""}`}>
            {label && (
                <label {...label} htmlFor={id} className="space-x-1">
                    {label.icon && <label.icon className="size-4" />}
                    {label.text && <span>{label.text}</span>}
                </label>
            )}
            <input {...props} id={id} />
        </div>
    );
}
