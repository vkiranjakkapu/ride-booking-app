import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import type { ActionButtonProps } from "../ActionButtonComponent";
import ActionButton from "../ActionButtonComponent";
import {
    PaginationButtons,
    type PaginationButtonsProps,
} from "../pagination/PaginationButtons";

export type SectionLayoutComponentProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    title?: string;
    description?: string;
    actionButtons?: ActionButtonProps[];
    pagination?: PaginationButtonsProps;
    search?: InputHTMLAttributes<HTMLInputElement>;
};

export default function SectionLayoutComponent({
    children,
    title,
    description,
    actionButtons,
    pagination,
    search,
    ...props
}: SectionLayoutComponentProps) {
    return (
        <section {...props} className={`space-y-3 p-4 lg:p-5 bg-theme rounded ${props.className}`}>
            {(title || description || actionButtons) && (
                <div className="flex flex-wrap items-center justify-between">
                    <div>
                        {(title || description) && (
                            <>
                                <h1>{title}</h1>
                                <p className="text-sm">{description}</p>
                            </>
                        )}
                    </div>
                    {actionButtons && (
                        <div>
                            {actionButtons.map((btn, idx) => (
                                <ActionButton key={idx} {...btn} />
                            ))}
                        </div>
                    )}
                </div>
            )}
            {(pagination || search) && (
                <div className="flex flex-wrap items-center justify-between">
                    <div>
                        {pagination && <PaginationButtons {...pagination} />}
                    </div>
                    {search && (
                        <div>
                            <input {...search} />
                        </div>
                    )}
                </div>
            )}
            {children}
        </section>
    );
}
