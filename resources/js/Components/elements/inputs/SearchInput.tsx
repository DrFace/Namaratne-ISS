
import { CircleStackIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";

export default forwardRef(function SearchInput(
    {
        className = "",
        isFocused = false,
        resetSearch,
        searchLoader,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        isFocused?: boolean;
        resetSearch: any;
        searchLoader: boolean;
    },
    ref
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
        clear: () => {
            if (localRef.current) {
                localRef.current.value = "";
            }
        },
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const handleResetSearch = () => {
        resetSearch();
        if (localRef.current) {
            localRef.current.value = "";
        }
    };

    return (
        <div className="flex w-full mt-2 rounded-full shadow-sm">
            <div className="relative flex items-stretch flex-grow focus-within:z-10">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MagnifyingGlassIcon
                        className="w-5 h-5 text-gray-800"
                        aria-hidden="true"
                    />
                </div>
                <input
                    {...props}
                    ref={localRef}
                    className="focus:ring-primary block w-full rounded-none rounded-l-2xl border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                />
            </div>
            <button
                type="button"
                onClick={handleResetSearch}
                className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-2xl px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
                {!searchLoader && (
                    <XMarkIcon
                        className="-ml-0.5 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                    />
                )}
                {searchLoader && (
                    <div className="w-5 h-5 ease-linear border-2 border-t-4 border-gray-400 rounded-full loader animate-spin" />
                )}
                {/* <span>{searchLoader ? "Loading..." : "Clear"}</span> */}
            </button>
        </div>
    );
});
