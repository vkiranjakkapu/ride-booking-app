import { XMarkIcon } from "@heroicons/react/24/outline";
import ActionButton from "../../components/ActionButtonComponent";
import DividerComponent from "../../components/DividerComponent";
import type { SpinnerComponentProps } from "../../components/SpinnerComponent";
import SpinnerComponent from "../../components/SpinnerComponent";
import type { SearchResult } from "./MapDtos";

type SearchResultsComponentProps = {
    title: string;
    results: SearchResult[];

    onSelect: (result: SearchResult) => void;
    onClose: () => void;

    spinner?: SpinnerComponentProps;
};

export default function SearchResultsComponent({
    title,
    results,
    onSelect,
    onClose,
    spinner,
}: SearchResultsComponentProps) {
    return (
        <div className="absolute top-full m-1 rounded inset-x-0 bg-theme dark:bg-dark-primary border dark:border-dark-secondary z-1 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <DividerComponent text={title} />
                    {spinner && spinner.isLoading && (
                        <SpinnerComponent
                            customize="justify-end! w-fit!"
                            size="size-3.5"
                            {...spinner}
                        />
                    )}
                </div>
                <ActionButton
                    icon={XMarkIcon}
                    className="primary p-1"
                    onClick={onClose}
                />
            </div>
            <hr className="border-t" />
            <div className={`divide-y max-h-70 overflow-y-scroll`}>
                {spinner && spinner.isLoading ? (
                    <p className="p-2 bg-primary dark:bg-dark-secondary cursor-pointer animate-pulse"></p>
                ) : results.length == 0 ? (
                    <>
                        <p className="p-2 bg-primary dark:bg-dark-secondary cursor-pointer">
                            No matching locations found.
                        </p>
                    </>
                ) : (
                    results.map((result) => (
                        <p
                            key={`${result.lat}-${result.lon}`}
                            className="p-2 bg-primary/40 dark:bg-dark-secondary/40 hover:bg-primary dark:hover:bg-dark-secondary cursor-pointer"
                            onClick={() => {
                                onSelect(result);
                                onClose();
                            }}
                        >
                            {result.display_name}
                        </p>
                    ))
                )}
            </div>
        </div>
    );
}
