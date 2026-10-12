import {
    type InputHTMLAttributes,
    type TableHTMLAttributes
} from "react";

import { renderCellValue, type IconProps } from "./commons";
import type { PaginationButtonsProps } from "./pagination/PaginationButtons";
import SpinnerComponent, {
    type SpinnerComponentProps,
} from "./SpinnerComponent";
import SectionLayoutComponent from "./layouts/SectionLayoutComponent";

/**
 * Configuration properties for the generic {@link TableComponent}.
 *
 * @template T
 * The type of each row in the table.
 *
 * @example
 * ```tsx
 * type User = {
 *     id: number;
 *     name: string;
 *     email: string;
 * };
 *
 * const users: User[] = [...];
 *
 * <TableComponent<User>
 *     title="Users"
 *     body={users}
 * />
 * ```
 */
export type TableComponentProps<T> = TableHTMLAttributes<HTMLTableElement> & {
    /**
     * Optional title displayed above the table.
     *
     * @example
     * ```tsx
     * title="Users"
     * ```
     */
    title?: string;

    /**
     * Optional description displayed below the table title.
     */
    description?: string;

    /**
     * Defines the columns to display and their aliases.
     *
     * When omitted, the component automatically derives the columns
     * from the row containing the highest number of properties.
     *
     * @example
     * ```tsx
     * headers={[
     *     { key: "name", alias: "User Name" },
     *     { key: "email", alias: "Email Address" },
     * ]}
     * ```
     */
    columns?: HeaderAlias<T>[];

    /**
     * Controls whether the table header should be disabled.
     *
     * When `true`, the `<thead>` is not rendered.
     *
     * @default false
     */
    enableHeader?: boolean;

    /**
     * Data rows rendered by the table.
     *
     * Each object represents one table row.
     */
    body: T[];

    /**
     * Defines additional action columns displayed at the end
     * of each table row.
     *
     * An action can optionally provide a navigation event that
     * receives the complete row item when clicked.
     *
     * @example
     * ```tsx
     * actionEvents={[
     *     {
     *         title: "Actions",
     *         navigation: {
     *             text: "View",
     *             onClick: (user) => {
     *                 console.log(user);
     *             },
     *         },
     *     },
     * ]}
     * ```
     */
    actionEvents?: {
        /**
         * Header text displayed for the action column.
         */
        title: string;

        /**
         * Optional action configuration.
         */
        clickEvent: {
            /**
             * Text displayed for the action.
             */
            text?: string;

            /**
             * customise the text displayed.
             */
            className?: string;

            /**
             * Icon to be displayed after the text
             */
            icon?: IconProps;

            /**
             * Callback invoked with the complete row item.
             */
            onClick: (item: T) => void;
        };
    }[];

    /**
     * Optional loading element to display before the table data got prepared.
     *
     */
    loading?: { showSpinner?: boolean; spinner?: SpinnerComponentProps };

    /**
     * Optional search configuration passed to the
     * {@link SectionLayoutComponent}.
     *
     * The table itself does not perform filtering; search behavior
     * is expected to be handled by the consumer.
     */
    search?: InputHTMLAttributes<HTMLInputElement>;

    /**
     * Optional pagination configuration passed to the
     * {@link SectionLayoutComponent}.
     *
     * Pagination behavior is controlled by the supplied
     * pagination component configuration.
     */
    pagination?: PaginationButtonsProps;
};

/**
 * Defines the relationship between a property of a table row and
 * the label displayed for that property in the table header.
 *
 * @template T
 * The type of the table row.
 *
 * @example
 * ```tsx
 * type User = {
 *     id: number;
 *     name: string;
 * };
 *
 * const headers: HeaderAlias<User>[] = [
 *     {
 *         key: "id",
 *         alias: "User ID",
 *     },
 *     {
 *         key: "name",
 *         alias: "User Name",
 *     },
 * ];
 * ```
 */
export type HeaderAlias<T> = {
    /**
     * Property from the row object that should be rendered.
     */
    key: keyof T;

    /**
     * Optional human-readable column heading.
     *
     * If omitted, the property name is used as the heading.
     */
    alias?: string;

    /**
     * Optional Column content customisation.
     *
     * Values suplied is used as 'className' for the column value cells
     */
    customiseColumn?: string;
};

/**
 * Generic and reusable table component.
 *
 * The component supports:
 *
 * - Generic row types through `T`
 * - Automatic column discovery
 * - Explicit column configuration
 * - Column aliases
 * - Optional table header
 * - Row-level actions
 * - Search configuration
 * - Pagination configuration
 * - Horizontal scrolling for wide tables
 * - Generic cell-value rendering
 * - Empty-state handling
 *
 * When `headers` are not supplied, the component determines the table
 * columns automatically by inspecting the row containing the greatest
 * number of properties. This allows the component to handle data where
 * individual rows may contain different properties.
 *
 * @template T
 * The type of each row in the table.
 *
 * @param props
 * Component configuration and standard HTML table attributes.
 *
 * @returns A reusable table wrapped inside {@link SectionLayoutComponent}.
 *
 * @example
 * Basic usage with automatic headers:
 *
 * ```tsx
 * type User = {
 *     id: number;
 *     name: string;
 *     email: string;
 * };
 *
 * const users: User[] = [
 *     {
 *         id: 1,
 *         name: "Venkat",
 *         email: "venkat@example.com",
 *     },
 * ];
 *
 * <TableComponent<User>
 *     title="Users"
 *     description="Registered users"
 *     body={users}
 * />
 * ```
 *
 * @example
 * Usage with explicit headers:
 *
 * ```tsx
 * <TableComponent<User>
 *     title="Users"
 *     body={users}
 *     headers={[
 *         { key: "id", alias: "ID" },
 *         { key: "name", alias: "Name" },
 *         { key: "email", alias: "Email" },
 *     ]}
 * />
 * ```
 *
 * @example
 * Usage with row actions:
 *
 * ```tsx
 * <TableComponent<User>
 *     title="Users"
 *     body={users}
 *     actionEvents={[
 *         {
 *             title: "Actions",
 *             navigation: {
 *                 text: "View",
 *                 onClick: (user) => {
 *                     console.log("Selected user:", user);
 *                 },
 *             },
 *         },
 *     ]}
 * />
 * ```
 */
export default function TableComponent<T>({
    title,
    description,
    columns: headers,
    enableHeader = false,
    body,
    actionEvents,
    loading,
    search,
    pagination,
}: TableComponentProps<T>) {
    /**
     * Determines the columns that should be rendered.
     *
     * If explicit headers are provided, they take precedence.
     *
     * Otherwise, the component examines the row with the greatest
     * number of properties and derives the column definitions from
     * that row.
     *
     * An empty data set results in an empty column definition.
     */
    const cols =
        body.length != 0
            ? !headers || headers.length == 0
                ? Object.keys(
                      body.reduce(
                          (maxRow, currentRow) =>
                              Object.keys(currentRow as object).length >
                              Object.keys(maxRow as object).length
                                  ? currentRow
                                  : maxRow,
                          body[0],
                      ) as object,
                  ).map((key) => ({ key }) as HeaderAlias<T>)
                : headers
            : [];

    return (
        <SectionLayoutComponent
            title={title}
            description={description}
            search={search}
            pagination={pagination}
        >
            <div className="overflow-x-auto overflow-y-clip rounded-md">
                {loading && loading.showSpinner ? (
                    <SpinnerComponent
                        {...loading.spinner}
                        animate={`${loading.spinner?.animate ?? "animate-pulse"}`}
                    />
                ) : body.length > 0 ? (
                    <table
                        className={`
                        w-full min-w-max text-left text-sm
                        [&_th,td]:px-6
                        [&_th]:py-4
                        [&_td]:py-2.5

                        [&_tr>*:last-child:is(.fullSpan)]:bg-primary/20
                        [&_tr]:hover:bg-primary/10
                        [&_tr]:even:bg-slate-100
                        dark:[&_tr]:even:bg-slate-600/20
                    `}
                        // [&_tr>*:last-child:not(.fullSpan)]:text-end
                    >
                        {!enableHeader && body.length > 0 && (
                            <thead
                                className={`
                                text-xs font-semibold uppercase tracking-wider 
                                bg-primary/10 dark:bg-slate-800
                                border-b dark:text-primary
                            `}
                            >
                                <tr>
                                    {cols.map((column, idx) => (
                                        <th scope="col" key={"th" + idx}>
                                            {String(column.alias ?? column.key)}
                                        </th>
                                    ))}

                                    {actionEvents &&
                                        actionEvents.map((action, idx) => (
                                            <th key={"ae" + idx}>
                                                {action.title}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                        )}

                        <tbody
                            className={`
                            divide-y transition-colors
                            *:transition-colors
                        `}
                        >
                            {body.map((item, idx) => (
                                <tr key={"tb" + idx} className="group">
                                    {cols.map((column) => {
                                        const hasLineClamp =
                                            column.customiseColumn?.includes(
                                                "line-clamp",
                                            );

                                        return (
                                            <td
                                                key={String(column.key)}
                                                className={`relative overflow-hidden ${column.customiseColumn}`}
                                                title={renderCellValue(
                                                    String(item[column.key]),
                                                    true,
                                                )}
                                            >
                                                {hasLineClamp ? (
                                                    <>
                                                        <div
                                                            className={
                                                                column.customiseColumn
                                                            }
                                                        >
                                                            {renderCellValue(
                                                                String(
                                                                    item[
                                                                        column
                                                                            .key
                                                                    ],
                                                                ),
                                                            )}
                                                        </div>
                                                        <div className="absolute inset-x-0 bottom-0 h-5 bg-linear-to-t from-white dark:from-transparent group-hover:from-transparent to-transparent pointer-events-none transition-colors" />
                                                    </>
                                                ) : (
                                                    renderCellValue(
                                                        String(
                                                            item[column.key],
                                                        ),
                                                    )
                                                )}
                                            </td>
                                        );
                                    })}

                                    {actionEvents &&
                                        actionEvents.map(
                                            (action, actionIdx) => {
                                                const clickEvent =
                                                    action.clickEvent;

                                                return (
                                                    <td key={"act" + actionIdx}>
                                                        {clickEvent && (
                                                            <span
                                                                onClick={() => {
                                                                    clickEvent.onClick(
                                                                        item,
                                                                    );
                                                                }}
                                                                className={`cursor-pointer flex flex-row items-center gap-1 ${clickEvent.className}`}
                                                            >
                                                                {
                                                                    clickEvent.text
                                                                }
                                                                {clickEvent.icon && (
                                                                    <clickEvent.icon
                                                                        className={`${clickEvent.text != undefined ? "size-4" : "size-5 mx-auto"}`}
                                                                    />
                                                                )}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            },
                                        )}
                                </tr>
                            ))}

                            {body.length == 0 && (
                                <tr>
                                    <td className="fullSpan capitalize text-center">
                                        No Data to display
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    "No Data to display"
                )}
            </div>
        </SectionLayoutComponent>
    );
}
