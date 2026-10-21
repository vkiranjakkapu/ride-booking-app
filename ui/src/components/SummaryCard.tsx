import type { SpinnerComponentProps } from "./SpinnerComponent";
import SpinnerComponent from "./SpinnerComponent";

type SummaryCardProps = {
    title: string;
    value: string;
    description: string;
    valueClassName?: string;
    spinner?: SpinnerComponentProps;
};

export default function SummaryCard({
    title,
    value,
    description,
    valueClassName,
    spinner,
}: SummaryCardProps) {
    return (
        <div className="p-5 rounded-xl border bg-white dark:bg-dark-primary shadow-sm">
            <p className="text-sm font-medium text-current/70">{title}</p>

            <p
                className={`mt-3 wrap-break-words text-2xl font-bold ${valueClassName}`}
            >
                {spinner && spinner.isLoading ? (
                    <SpinnerComponent
                        {...spinner}
                        customize={`animate-pulse w-fit! ${spinner.customize}`}
                    />
                ) : (
                    value
                )}
            </p>

            <p className="mt-2 text-xs text-current/70">{description}</p>
        </div>
    );
}
