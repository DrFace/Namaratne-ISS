import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { HomeIcon } from "@heroicons/react/24/outline";
import { Link } from "@inertiajs/react";
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

const Breadcrumbs = (props: { routes: any }) => {
    return (
        <nav className="self-center flex" aria-label="Breadcrumb">
            <ol
                role="list"
                className="flex items-center space-x-1 lg:space-x-4"
            >
                <li className="flex">
                    <HomeIcon className="h-3 w-3 lg:h-5 lg:w-5 flex-shrink-0 text-slate-300" />
                </li>
                {props.routes.map(
                    (
                        route: {
                            name: string;
                            hasArrow: boolean;
                            link: string;
                        },
                        index: any
                    ) => (
                        <li key={index}>
                            <div className="flex">
                                {route.hasArrow && (
                                    <ChevronRightIcon
                                        className=" h-3 w-3 lg:h-5 lg:w-5 flex-shrink-0 text-slate-300"
                                        aria-hidden="true"
                                    />
                                )}
                                <Link
                                    href={route.link}
                                    className={classNames(
                                        route.hasArrow ? " ml-1 lg:ml-4" : "",
                                        " text-[10px] lg:text-sm font-medium text-slate-300 hover:text-gray-100"
                                    )}
                                >
                                    {route.name}
                                </Link>
                            </div>
                        </li>
                    )
                )}
            </ol>
        </nav>
    );
};
export default Breadcrumbs;
