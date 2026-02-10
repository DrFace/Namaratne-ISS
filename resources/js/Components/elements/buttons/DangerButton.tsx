import { InertiaLinkProps, Link } from '@inertiajs/react';
import { ButtonHTMLAttributes } from 'react';

const classes =
    "inline-flex items-center px-6 py-3 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:brightness-90 focus:brightness-90 active:brightness-90 focus:outline-none  transition ease-in-out duration-150";

    const disabledClasses = "opacity-25 cursor-not-allowed";

export function DangerButton({
    className = "",
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={` ${classes} ${
                disabled && disabledClasses
            }  ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}


export function DangerLink({
    className = "",
    disabled,
    children,
    href,
    ...props
}: InertiaLinkProps & {
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            {...props}
            className={` ${classes} ${disabled && disabledClasses} ${className}`}
            disabled={disabled}
        >
            {children}
        </Link>
    );
}
