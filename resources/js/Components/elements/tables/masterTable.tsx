import {
    ArrowDownIcon,
    ArrowUpIcon,
    ChevronUpIcon,
    PlusIcon,
} from "@heroicons/react/20/solid";
import { router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { PrimaryLink } from "../buttons/PrimaryButton";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import SearchInput from "../inputs/SearchInput";
import Pagination from "../../shared/Pagination";
import { SecondaryLink } from "../buttons/SecondaryButton";
import { Link, redirect } from "react-router-dom";
import { addYears, format } from "date-fns";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css";

export function TableBody({
    id,
    children,
    buttons,
}: {
    id: any;
    children: any;
    buttons: any;
}) {
    return (
        <Disclosure as="tbody" className="w-full bg-white " key={id}>
            {({ open }) => (
                <>
                    <tr key={id + "p"}>
                        <TableTd width={10}>
                            <Disclosure.Button className="w-12 text-gray-900">
                                <span className="flex items-center">
                                    {open ? (
                                        <ChevronDownIcon
                                            className="w-4 h-4"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <ChevronRightIcon
                                            className="w-4 h-4"
                                            aria-hidden="true"
                                        />
                                    )}
                                </span>
                            </Disclosure.Button>
                        </TableTd>
                        {children}
                    </tr>
                    <tr key={id + "c"}>
                        <Disclosure.Panel
                            as="td"
                            colSpan={100}
                            className="py-4 pl-4 pr-3 whitespace-nowrap bg-gray-50 sm:pl-6 "
                        >
                            <span className="flex items-center space-x-4">
                                {buttons}
                            </span>
                        </Disclosure.Panel>
                    </tr>
                </>
            )}
        </Disclosure>
    );
}

export function TableTd({
    children,
    width,
}: {
    children: any;
    width?: number;
}) {
    return (
        <td
            width={width}
            className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-wrap sm:pl-6"
        >
            <div className="max-w-[40ch]  break-words">
                {children}
            </div>

        </td>
    );
}

export default function MasterTable({
    tableColumns,
    filters,
    url,
    createLink,
    importLink,
    exportLink,
    importTemplateLink,
    filterBar = true,
    search,
    links,
    children,
    statusFilter,
    hideDateRange = false,
}: {
    tableColumns: any;
    filters: any;
    url: string;
    createLink?: {
        label: string;
        url: string;
    };
    importLink?: {
        label: string;
        url: string;
    };
    exportLink?: {
        label: string;
        url: string;
    };
    importTemplateLink?: {
        label: string;
        url: string;
    };
    search?: {
        placeholder: string;
        status: string;
    };
    filterBar?: boolean;
    links: any;
    children: any;
    statusFilter?: any;
    hideDateRange?: boolean;
}) {
    const [searchParam, setSearchParam, searchParamRef] = useStateRef(
        filters.searchParam ?? ""
    );
    const [page, setPage] = useState(filters.page ?? 1);
    const [rowPerPage, setRowPerPage] = useState(filters.perPage ?? 10);
    const [sortBy, setSortBy] = useState(filters.sortBy ?? "name");
    const [sortDirection, setSortDirection] = useState(filters.sortDirection ?? "desc");
    const [date, setDate] = useState({
        startDate: filters.range1 ? new Date(filters.range1) : new Date(),
        endDate: filters.range2 ? new Date(filters.range2) : new Date(),
        key: "selection",
    });
    // const [
    const [importMode, setImportMode] = useState(false);
    const [searchLoader, setSearchLoader] = useState(false);
    const [openDate, setOpenDate] = useState(false);

    const [previousDate, setPreviousDate] = useState({
        startDate: new Date(filters.range1),
        endDate: new Date(filters.range2),
    });



    function revisitPage() {
        router.get(
            url,
            {
                page: page,
                rowPerPage: rowPerPage,
                sortBy: sortBy,
                sortDirection: sortDirection,
                // searchParam: searchParam,
                searchParam: searchParamRef.current,

                // status: search?.status ?? statusFilter?.status,
            },
            {
                replace: true,
                preserveState: true,
            }
        );

    }


    function revisit() {

        if (previousDate.startDate.getTime() !== date.startDate.getTime() || previousDate.endDate.getTime() !== date.endDate.getTime()) {
            router.get(
                url,
                {
                    range1: format(date.startDate, "yyyy-MM-dd"),
                    range2: format(date.endDate, "yyyy-MM-dd"),
                },
                {
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                }
            );
            setPreviousDate(date);
        }
    }

    const handleOnSort = (column: any, direction: any, e: any) => {
        if (column && direction) {
            setSortBy(column);
            setSortDirection(direction);
            revisitPage();
        }
    };

    const debouncedHandleSearch = useDebouncedCallback(
        // function
        (value) => {
            setSearchParam(value);
            setPage(1);
            revisitPage();
        },
        // delay in ms
        300
    );

    const debouncedHandleDateRange = useDebouncedCallback(
        // function
        (ranges) => {
            setDate(ranges.selection);
            setPage(1);
            revisit();
            setOpenDate(false);
        },

    );

    const resetSearch = (e: any) => {
        setSearchParam("");
        setPage(1);
        revisitPage();
    };

    // useEffect(() => {
    //     revisitPage();
    // }
    //     , [page, rowPerPage, sortBy, sortDirection, searchParam]);

    useEffect(() => {
        revisit();
    }, [date]);

    const resetDateFilters = () => {
        router.visit(url, {

            method: "get",
            data: {
                preserveState: true,
                preserveScroll: true,
            },
        });
    };


    function tableTh({
        label,
        sortField,
        sortable,
    }: {
        label: string;
        sortField: string;
        sortable: boolean;
    }) {
        return (
            <th
                key={sortField}
                onClick={(e) =>
                    sortable &&
                    handleOnSort(
                        sortField,
                        sortDirection == "asc" ? "desc" : "asc",
                        e
                    )
                }
                scope="col"
                className={
                    (sortable ? " cursor-pointer " : " cursor-default ") +
                    " py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                }
            >
                <div className="flex">
                    {label}
                    {sortBy == sortField && sortDirection == "asc" && (
                        <ChevronUpIcon className="w-5 h-5" aria-hidden="true" />
                    )}
                    {sortBy == sortField && sortDirection == "desc" && (
                        <ChevronDownIcon
                            className="w-5 h-5"
                            aria-hidden="true"
                        />
                    )}
                </div>
            </th>
        );
    }

    return (
        <>
            {(!hideDateRange || !(search == undefined)) && <div className="mt-8 md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    {/* Filter */}
                    <div className="flex flex-col justify-between gap-2 p-4 space-x-2 overflow-hidden bg-white rounded-lg shadow sm:flex-row">
                        <div className="flex flex-col self-center gap-2 lg:flex-row w-2/8">
                            {search && (
                                <SearchInput
                                    id="search"
                                    className="self-center block w-full shadow-card"
                                    // isFocused
                                    searchLoader={searchLoader}
                                    defaultValue={searchParamRef.current}
                                    placeholder={search.placeholder}
                                    resetSearch={resetSearch}
                                    autoComplete="search"
                                    onChange={(e) =>
                                        debouncedHandleSearch(e.target.value)
                                    }
                                />
                            )}
                            {/* Date Range */}
                            {!hideDateRange && <div className="flex flex-col">

                                <div className="relative flex flex-row w-full mt-2">
                                    <span
                                        className="p-2.5   text-xs lg:w-[300px] md:w-[300px] w-full border rounded-none cursor-pointer rounded-l-2xl  border-slate-300 "
                                        onClick={() => setOpenDate(!openDate)}
                                    >
                                        {!filters.range1
                                            ? <span className="px-2 text-gray-400 ">Select Date Range</span>
                                            : date.startDate.toDateString() === date.endDate.toDateString() ? (
                                                format(date?.startDate, "MMM dd, yyyy")
                                            ) : (
                                                `${format(date?.startDate, "MMM dd, yyyy")} - ${format(date?.endDate, "MMM dd, yyyy")}`
                                            )}

                                    </span>
                                    <button
                                        type="button"
                                        onClick={resetDateFilters}
                                        className="px-2 text-sm transition duration-200 border rounded-none cursor-pointer border-slate-300 rounded-r-2xl"
                                    >
                                        <XMarkIcon
                                            className="w-5 h-5 text-gray-400 "
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                                {openDate && (
                                    <DateRangePicker
                                        className="absolute top-[12rem] sm:right-[10rem] z-50 dateRange "
                                        ranges={[date]}
                                        onChange={(item) => debouncedHandleDateRange(item)}
                                        maxDate={new Date()}
                                    />
                                )}
                            </div>}
                        </div>
                        <div className="flex justify-end space-x-4">
                            {createLink && (
                                <PrimaryLink
                                    href={createLink.url}
                                    className="self-center"
                                >
                                    <PlusIcon className="w-4 h-4 text-white" />
                                    <span className="">
                                        {createLink.label}
                                    </span>
                                </PrimaryLink>
                            )}
                            {/* import */}
                            {importLink && (
                                <button
                                    onClick={() => setImportMode(!importMode)}
                                    className="flex items-center self-center px-6 py-3 space-x-2 text-xs font-semibold tracking-widest text-white uppercase transition duration-150 ease-in-out border border-transparent rounded-md bg-secondary hover:brightness-90 focus:brightness-90 active:brightness-90 focus:outline-none"
                                >
                                    <ArrowDownIcon className="w-4 h-4 text-white" />
                                    <span className="hidden sm:block">
                                        {importLink.label}
                                    </span>
                                </button>
                            )}
                            {/* Export */}
                            {exportLink && (
                                <a
                                    href={exportLink.url}
                                    className="flex items-center self-center px-6 py-3 space-x-2 text-xs font-semibold tracking-widest text-white uppercase transition duration-150 ease-in-out border border-transparent rounded-md bg-secondary hover:brightness-90 focus:brightness-90 active:brightness-90 focus:outline-none"
                                >
                                    <ArrowUpIcon className="w-4 h-4 text-white" />
                                    <span className="hidden sm:block">
                                        {exportLink.label}
                                    </span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>}

            <div className="flow-root mt-8 bg-white rounded-lg shadow">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {tableColumns.map((column: any) =>
                                            tableTh({
                                                label: column.label,
                                                sortField: column.sortField,
                                                sortable: column.sortable,
                                            })
                                        )}
                                    </tr>
                                </thead>
                                {children.length === 0 ? (
                                    <tbody>
                                        <tr>
                                            <td
                                                colSpan={tableColumns.length}
                                                className="py-4 text-sm text-center text-gray-500"
                                            >
                                                <div className="w-full flex min-h-[100px] justify-center items-center text-center border-dashed border border-gray-200 italic text-gray-500 text-sm">
                                                    Sorry No Data found
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    children
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Pagination links={links} />

            <ImportModal
                title="Import File"
                importMode={importMode}
                setImportMode={setImportMode}
                importLink={importLink}
                importTemplateLink={importTemplateLink}
            />
        </>
    );
}

import { useForm } from "@inertiajs/react";
import useStateRef from "react-usestateref";
import { useDebouncedCallback } from "use-debounce";
import { DateRangePicker } from "react-date-range";


export function ImportModal({
    title,
    importMode,
    setImportMode,
    importLink,
    importTemplateLink,
}: {
    title: string;
    importMode: boolean;
    setImportMode: any;
    importLink: any;
    importTemplateLink?: any;
}) {
    const { data, setData, post, progress, errors, reset } = useForm({
        file: null,
    });

    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        const allowedTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv",
        ];

        if (file && allowedTypes.includes(file.type)) {
            setData("file", file);
            setFileError(null);
        } else {
            setFileError("Please upload a valid file (XLSX, XLS, CSV)");
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (data.file) {
            post(importLink.url, {
                onSuccess: () => {
                    setImportMode(false);
                    handleReset();
                },
            });
        } else {
            setFileError("Please upload a valid file (XLSX, XLS, CSV)");
        }
    };

    const handleReset = () => {
        setData("file", null);
        setFileError(null);
        reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div
            className={
                (importMode ? "block " : "hidden ") +
                "fixed inset-0 z-10001 overflow-y-auto "
            }
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 ">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-75"
                    aria-hidden="true"
                ></div>
                <span
                    className="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true"
                >
                    &#8203;
                </span>
                <div
                    className="inline-block w-[650px] px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-headline"
                >
                    <div className="mb-3">
                        <label
                            htmlFor="formFile"
                            className="inline-block mb-2 text-sm font-medium text-neutral-400"
                        >
                            Upload Your XLSX, XLS, CSV File Here
                        </label>
                        <input
                            ref={fileInputRef}
                            className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none"
                            type="file"
                            id="formFile"
                            name="file"
                            onChange={handleFileChange}
                        />
                        {fileError && (
                            <div className="text-sm text-red-500">
                                {fileError}
                            </div>
                        )}
                        {errors.file && (
                            <div className="text-sm text-red-500">
                                {errors.file}
                            </div>
                        )}
                    </div>

                    <div className="grid w-full grid-cols-1 gap-6 mt-5 sm:grid-cols-2 sm:mt-6">
                        <div className="flex flex-col pt-4">
                            <span className="text-sm text-neutral-400">
                                You can download the template file from here
                            </span>
                            <a
                                href={importTemplateLink?.url}
                                className="text-blue-600 underline hover:text-blue-800"
                            >
                                Download
                            </a>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex justify-end mt-5 sm:mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImportMode(false);
                                        handleReset();
                                    }}
                                    className="justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-secondary hover:brightness-90 focus:brightness-90 active:brightness-90 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:brightness-90 focus:brightness-90 active:brightness-90 focus:outline-none"
                                    onClick={handleSubmit}
                                >
                                    Import
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
