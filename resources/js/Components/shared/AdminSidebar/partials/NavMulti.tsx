import { Link, usePage } from "@inertiajs/react";
import NavSeparator from "./NavSeparator";
import NavTitle from "./NavTitle";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { useLaravelReactI18n } from "laravel-react-i18n";
import DynamicHeroIcon from "@/Components/elements/icons/DynamicHeroIcon";
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export default function NavMulti({
    startWith,
    name,
    icon,
    children,
}: {
    startWith?: string;
    name: any;
    icon: any;
    children: any;
}) {
    const { url } = usePage();

    function isActive(startWith?: string) {
        if (startWith == "/") {
            return url == startWith;
        } else {
            return url.startsWith(startWith ?? "");
        }
    }

    const [dropState, setDropState] = useState(false);

    return (
        <div className="py-1">
            <span
                onClick={() => setDropState(!dropState)}
                className={classNames(
                    isActive(startWith)
                        ? " text-slate-800 shadow bg-white "
                        : "text-slate-500 hover:text-slate-700 cursor-pointer hover:shadow hover:bg-white ",
                    " group flex items-center text-sm p-3 rounded-lg font-medium   duration-300 ease-in-out transition-all w-full "
                )}
                aria-current={isActive(startWith) ? "page" : undefined}
            >
                <DynamicHeroIcon
                    icon={icon}
                    className={classNames(
                        isActive(startWith)
                            ? "active text-slate-600"
                            : "text-slate-500 group-hover:text-slate-300 duration-300 ease-in-out transition-all",
                        " mr-4 h-4 w-4 flex-shrink-0 "
                    )}
                    aria-hidden="true"
                />
                <span className="text"> {name}</span>
                {isActive(startWith) || dropState ? (
                    <ChevronDownIcon className="text-slate-500 w-4 h-4 ml-auto" />
                ) : (
                    <ChevronRightIcon className="text-slate-500 w-4 h-4 ml-auto" />
                )}
            </span>
            <div
                className={
                    (dropState || isActive(startWith)
                        ? " block "
                        : " hidden ") +
                    " duration-300 ease-in-out transition-all w-full bg-white px-4 shadow-sm py-4 rounded-lg mt-2 "
                }
            >
                <ul className="space-y-3">
                    {children.map(
                        (
                            child: {
                                startWith: string;
                                route: string;
                                name: string;
                                icon: any;
                            },
                            index: number
                        ) => (
                            <li key={index}>
                                <Link
                                    href={route(child.route)}
                                    className={classNames(
                                        isActive(child.startWith)
                                            ? " text-slate-600"
                                            : "text-slate-500 hover:text-slate-600",
                                        " group mt-0 flex items-center text-sm font-medium leading-6  duration-200 ease-in-out transition-color w-full "
                                    )}
                                    aria-current={
                                        isActive(child.startWith)
                                            ? "page"
                                            : undefined
                                    }
                                >
                                    <DynamicHeroIcon
                                        icon={child.icon}
                                        className={classNames(
                                            isActive(child.startWith)
                                                ? "active text-slate-600"
                                                : "text-slate-500 group-hover:text-slate-300 duration-200 ease-in-out transition-color",
                                            " mr-4 h-4 w-4 flex-shrink-0 "
                                        )}
                                        aria-hidden="true"
                                    />
                                    <span className="text"> {child.name}</span>
                                </Link>
                            </li>
                        )
                    )}
                </ul>
            </div>
        </div>
    );
}
