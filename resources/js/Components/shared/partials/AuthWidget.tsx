import { Menu, Popover, Transition } from "@headlessui/react";
import {
    ArrowLeftOnRectangleIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon,
    HomeModernIcon,
    UserIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link, usePage } from "@inertiajs/react";
import { Fragment, useState } from "react";

export function AuthWidget({ ...props }: any) {
    const { auth } = usePage().props;
    const user = (auth as { user?: any }).user;

    return (
        <>
            <Menu as="div" className="relative">
                <div>
                    <Menu.Button
                        className={props.className + " flex items-center "}
                    >
                        <UserIcon className="w-6 h-6 hover:text-primary" />
                    </Menu.Button>
                </div>
                {user ? (
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 z-50 w-48 py-0 pt-4 mt-2 origin-top-right rounded-md shadow-lg dropdown-menu bg-slate-100 ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <span className="hidden ml-3 text-sm font-medium text-left mb-2 truncate lg:block">
                                <span className="sr-only">
                                    Open user menu for{" "}
                                </span>
                                {user?.full_name ?? "Full Name"}
                                <br />
                                <span className="text-[10px] -mt-10 pt-0 ">
                                    {user?.email ?? "-n/a-"}
                                </span>
                            </span>
                            <Menu.Item>
                                <Link
                                    href={route("my-account.index")}
                                    className="z-10 flex w-full px-4 py-2 text-sm text-left  hover:bg-primary/80 hover:text-slate-900"
                                >
                                    <UserIcon className="self-center w-5 h-5 mr-2" />{" "}
                                    <span className="self-center">
                                        My Profile
                                    </span>
                                </Link>
                            </Menu.Item>{" "}
                            <hr className=" border-slate-400" />
                            {user?.role == "admin" && (
                                <Menu.Item>
                                    <Link
                                        href={route("admin.dashboard")}
                                        className="z-10 flex w-full px-4 py-2 text-sm text-left  hover:bg-primary/80 hover:text-slate-900"
                                    >
                                        <HomeModernIcon className="self-center w-5 h-5 mr-2" />{" "}
                                        <span className="self-center">
                                            Admin Panel
                                        </span>
                                    </Link>
                                </Menu.Item>
                            )}{" "}
                            <hr className=" border-slate-400" />
                            <Menu.Item>
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="flex w-full px-4 py-2 text-sm text-left  hover:bg-red-500/80 "
                                >
                                    <ArrowRightOnRectangleIcon className="self-center w-5 h-5 mr-2 " />
                                    <div className="self-center">Log Out</div>
                                </Link>
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                ) : (
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 z-50 w-48 py-0 pt-4 mt-2 origin-top-right rounded-md shadow-lg dropdown-menu bg-slate-100 ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <span className="hidden ml-3 text-sm font-medium text-left mb-2 truncate lg:block">
                                <span className="sr-only">
                                    Open user menu for{" "}
                                </span>
                                My Account
                            </span>
                            <Menu.Item>
                                <Link
                                    href={route("login")}
                                    className="z-10 flex w-full px-4 py-2 text-sm text-left  hover:bg-primary/80 hover:text-slate-900"
                                >
                                    <UserIcon className="self-center w-5 h-5 mr-2" />{" "}
                                    <span className="self-center">Login</span>
                                </Link>
                            </Menu.Item>{" "}
                            <hr className=" border-slate-400" />
                            <Menu.Item>
                                <Link
                                    href={route("register")}
                                    className="flex w-full px-4 py-2 text-sm text-left  hover:bg-red-500/80 "
                                >
                                    <ArrowLeftOnRectangleIcon className="self-center w-5 h-5 mr-2 " />
                                    <div className="self-center">Register</div>
                                </Link>
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                )}
            </Menu>
        </>
    );
}
