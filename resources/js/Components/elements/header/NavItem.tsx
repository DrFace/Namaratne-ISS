import { Link, usePage } from "@inertiajs/react";
import DynamicHeroIcon from "../icons/DynamicHeroIcon";
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

const NavItem = ({
    startWith,
    routeName,
    name,
    link,
    border,
    icon,
}: {
    startWith?: string;
    routeName?: any;
    name: any;
    link: boolean;
    border: boolean;
    icon: any;
}) => {
    const { url, component } = usePage();

    function isActive(startWith?: string) {
        if (startWith == "/") {
            return url == startWith;
        } else {
            return url.startsWith(startWith ?? "");
        }
    }

    return (
        <>
            {link ? (
                <div
                    className={classNames(
                        isActive(startWith)
                            ? "relative py-[20px]"
                            : "mb-0 mt-0 pb-0",
                        ""
                    )}
                >
                    <Link
                        href={routeName}
                        className={classNames(
                            isActive(startWith)
                                ? " active-nav rounded-[30px] bg-white text-primary-600"
                                : " text-white hover:bg-blue-800 hover:rounded-[30px] ",
                            " group mt-0 flex items-center px-2 py-2 text-sm font-medium leading-6"
                        )}
                        aria-current={isActive(startWith) ? "page" : undefined}
                    >
                        <DynamicHeroIcon
                            icon={icon}
                            className={classNames(
                                isActive(startWith)
                                    ? " text-slate-200 bg-primary p-1 h-8 w-8 "
                                    : " group-hover:text-slate-200 group-focus:text-slate-200 h-6  w-6 ",
                                " mr-4 flex-shrink-0 rounded-full transition ease-in-out duration-150 "
                            )}
                            aria-hidden="true"
                        />
                        <span>{name}</span>
                    </Link>
                </div>
            ) : border ? (
                <div
                    className={classNames(
                        name != "Dashboard" ? " border-t " : " ",
                        " pt-[15px] text-slate-300 border-slate-700 "
                    )}
                >
                    <span className="text-slate-300 ml-[25px] text-sm">
                        {name}
                    </span>
                </div>
            ) : (
                <div
                    className={classNames(
                        name != "Dashboard" ? "" : "",
                        " text-slate-300 "
                    )}
                >
                    <span className="text-slate-300 ml-[25px] text-sm">
                        {name}
                    </span>
                </div>
            )}
        </>
    );
};
export default NavItem;
