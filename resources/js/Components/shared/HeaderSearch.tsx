import {
    MagnifyingGlassIcon,
    MinusCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import useStateRef from "react-usestateref";

export default function HeaderSearch() {
    const { request }: any = usePage().props;
    const [searchParam, setSearchParam, searchParamRef] = useStateRef(
        request?.searchParam
    );
    function search() {
        router.get(
            route(""),
            {
                searchParam: searchParamRef.current,
            },
            {
                replace: true,
                preserveState: true,
            }
        );
    }
    function cleanSearch() {
        setSearchParam("");
        router.get(
            route(""),
            {
                searchParam: "",
            },
            {
                replace: true,
                preserveState: true,
            }
        );
    }
    return (
        <div className="flex-1 hidden min-w-0 transition-all duration-300 lg:block">
            <div className="flex items-center px-6 py-2 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none xl:px-0">
                <div className="w-full">
                    <label htmlFor="search" className="sr-only">
                        Search
                    </label>
                    <div className="relative">
                        <input
                            id="search"
                            name="search"
                            defaultValue={searchParamRef.current}
                            onChange={(e) => setSearchParam(e.target.value)}
                            className="block w-full placeholder:uppercase placeholder:tracking-[0.1px] rounded-md border-0 bg-gray-100 py-3 pl-4 pr-3 text-gray-900  placeholder:text-gray-400  sm:text-sm sm:leading-6"
                            placeholder="Search Your Items"
                            type="search"
                        />
                        {searchParamRef.current && (
                            <button
                                onClick={() => cleanSearch()}
                                className="absolute inset-y-0 flex items-center px-4 right-12"
                            >
                                <XMarkIcon
                                    className="w-6 text-red-500 h-7"
                                    aria-hidden="true"
                                />
                            </button>
                        )}
                        <button
                            onClick={() => search()}
                            className="absolute inset-y-0 right-0 flex items-center px-4 bg-primary-400 rounded-r-md"
                        >
                            <MagnifyingGlassIcon
                                className="w-5 h-5 text-primary-800"
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
