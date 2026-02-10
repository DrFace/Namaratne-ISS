import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { Link } from "@inertiajs/react";

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

const BreadCumbsPublic = (props: { routes: any; classesName?: any }) => {
    return (
        <nav className="flex mx-auto" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-1">
                <li>
                    <div className="flex">
                        <Link
                            href={route("home")}
                            className={classNames(
                                "text-sm font-medium text-blue-600 hover:text-gray-800 cursor-pointer",
                                props.classesName?.home // Apply the custom class if provided
                            )}
                        >
                            Home
                        </Link>
                    </div>
                </li>
                {props.routes.map(
                    (
                        route: {
                            name: string;
                            hasArrow: boolean;
                            link: string;
                            notLink?: boolean;
                        },
                        index: any
                    ) => (
                        <li key={index}>
                            <div className="flex">
                                {route.hasArrow && (
                                    <ChevronRightIcon
                                        className="self-center flex-shrink-0 w-5 h-5 text-white stroke-2 "
                                        aria-hidden="true"
                                    />
                                )}
                                {!route.notLink && (
                                    <Link
                                        href={route.link}
                                        className={classNames(
                                            route.hasArrow ? "ml-2" : "",
                                            "text-sm font-medium text-blue-600 hover:text-blue-800", 
                                            props.classesName?.link // Apply the custom class if provided
                                        )}
                                    >
                                        {route.name}
                                    </Link>
                                )}
                                {route.notLink && (
                                    <span
                                        className={classNames(
                                            route.hasArrow ? "ml-2" : "",
                                            "text-sm font-medium text-gray-600",
                                            props.classesName?.notLink // Apply the custom class if provided
                                        )}
                                    >
                                        {route.name}
                                    </span>
                                )}
                            </div>
                        </li>
                    )
                )}
            </ol>
        </nav>
    );
};

export default BreadCumbsPublic;
