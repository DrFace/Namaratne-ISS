import React from "react";
import classNames from "classnames";
import { Link } from "@inertiajs/react";

const PageLink = ({
    active,
    label,
    url,
}: {
    active: any;
    label: string;
    url: string;
}) => {
    const className = classNames(
        [
            'min-w-[31px]',
            "p-1",
            "rounded-full",
            "text-base",

            "focus:outline-none focus:border-indigo-700 text-primary",
        ],
        {
            "bg-primary": active,
            "text-white": active,
        }
    );
    return (
        <Link className={className} href={url}>
            <span dangerouslySetInnerHTML={{ __html: label }}></span>
        </Link>
    );
};

// Previous, if on first page
// Next, if on last page
// and dots, if exists (...)
const PageInactive = ({ label }: { label: string }) => {
    const className = classNames(
        " text-base p-2  text-gray-500"
    );
    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: label }}
        />
    );
};

export default ({ links = [] }) => {
    // dont render, if there's only 1 page (previous, 1, next)
    if (links.length === 3) return null;
    return (
        <div className="flex flex-row items-center justify-end gap-3 mt-6 text-center ">
            {links?.map(({ active, label, url }) => {
                return url === null ? (
                    <PageInactive key={label} label={label} />
                ) : (
                    <PageLink
                        key={label}
                        label={label}
                        active={active}
                        url={url}
                    />
                );
            })}
        </div>
    );
};
