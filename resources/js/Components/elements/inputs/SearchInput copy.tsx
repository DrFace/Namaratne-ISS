import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { forwardRef, useEffect, useImperativeHandle, useRef, InputHTMLAttributes } from 'react';

export default forwardRef(function SearchInput(
    {
        className = "",
        isFocused = false,
        resetSearch,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        isFocused?: boolean;
        resetSearch: any;
    },
    ref
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, []);

    return (
        <div className="flex w-full mt-2 rounded-full shadow-sm">
            <div className="relative flex items-stretch flex-grow w-full ">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MagnifyingGlassIcon
                        className="w-5 h-5 text-gray-800"
                        aria-hidden="true"
                    />
                </div>

                <input
                    {...props}
                    ref={localRef}
                    className="block w-full rounded-none rounded-l-2xl border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
            <button
                type="button"
                onClick={() => resetSearch()}
                className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-2xl px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset  "
            >
                <XMarkIcon className="w-5 h-5" aria-hidden="true" />
            </button>
        </div>
    );
});
