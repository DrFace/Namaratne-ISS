import { Link, usePage } from "@inertiajs/react";
import DynamicHeroIcon from "@/Components/elements/icons/DynamicHeroIcon";
import { LockClosedIcon } from "@heroicons/react/24/outline";

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export default function NavSingle({
    startWith,
    routeName,
    name,
    icon,
    count,
    disabled = false,
}: {
    startWith?: string;
    routeName?: any;
    name: any;
    icon: any;
    count: any;
    disabled?: boolean;
}) {
    const { url } = usePage();

    function isActive(startWith?: string) {
        if (startWith == "/") {
            return url == startWith;
        } else {
            return url.startsWith(startWith ?? "");
        }
    }

    const linkClasses = classNames(
        disabled
            ? "text-gray-400 bg-gray-100 cursor-not-allowed opacity-60"
            : isActive(startWith)
                ? "text-slate-600 shadow bg-white"
                : "text-slate-500 cursor-pointer hover:text-slate-700 hover:shadow hover:bg-white",
        "group mt-0 flex p-3 rounded-lg items-center text-sm font-medium duration-300 ease-in-out transition-all w-full"
    );

    const iconClasses = classNames(
        disabled
            ? "text-gray-400"
            : isActive(startWith)
                ? "active text-slate-600"
                : "text-slate-500 group-hover:text-slate-700 duration-300 ease-in-out transition-all",
        "mr-4 h-4 w-4 flex-shrink-0"
    );

    return (
        <div className="py-1 relative group">
            <Link
                href={disabled ? "#" : routeName}
                className={linkClasses}
                aria-current={isActive(startWith) ? "page" : undefined}
                onClick={(e) => disabled && e.preventDefault()}
            >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                        <DynamicHeroIcon
                            icon={icon}
                            className={iconClasses}
                            aria-hidden="true"
                        />
                        <span className="text">{name}</span>
                        {disabled && (
                            <LockClosedIcon className="w-3 h-3 ml-2 text-gray-400" />
                        )}
                    </div>
                    {count > 0 && (
                        <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-red-600 rounded-full P-4">
                            {count}
                        </div>
                    )}
                </div>
            </Link>
            {disabled && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Access restricted
                </div>
            )}
        </div>
    );
}
