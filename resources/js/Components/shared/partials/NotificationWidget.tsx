import { Popover, Transition } from "@headlessui/react";
import { BellAlertIcon, HeartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, router, useForm, usePage } from "@inertiajs/react";
import { Fragment, useState } from "react";


export default function NotificationWidget() {
    const { notificationData }: any = usePage().props;

    return (
        <>
            <Popover className="">
                {() => (
                    <>
                        <Popover.Button
                            className={
                                " flex  relative focus:border-none focus:ring-0 focus:outline-none"
                            }
                        >
                            <div
                                className="relative items-center w-8 h-8 hover:text-primary focus:border-none focus:ring-0 focus:outline-none"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="Notifications"
                            >
                                {notificationData?.unreadNotificationsCount > 0 && (
                                    <div className="absolute inline-flex w-2 h-2 bg-red-500 rounded-full animate-ping opacity-90 " />
                                )}
                                <svg width="30" height="30" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25.0591 21.7832C23.5544 19.8781 22.4921 18.9083 22.4921 13.656C22.4921 8.8463 20.1178 7.13274 18.1637 6.30051C17.9042 6.19019 17.6598 5.93682 17.5807 5.66103C17.238 4.4542 16.277 3.39102 14.9997 3.39102C13.7223 3.39102 12.7608 4.4548 12.4216 5.66224C12.3425 5.94106 12.0981 6.19019 11.8385 6.30051C9.8821 7.13395 7.51023 8.84146 7.51023 13.656C7.5073 18.9083 6.44499 19.8781 4.9403 21.7832C4.31687 22.5724 4.86296 23.7574 5.95339 23.7574H24.0518C25.1364 23.7574 25.679 22.5688 25.0591 21.7832Z" stroke="black" stroke-width="1.00189" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M18.7506 23.7574V24.7273C18.7506 25.7563 18.3554 26.7432 17.6521 27.4708C16.9487 28.1984 15.9947 28.6072 15 28.6072C14.0053 28.6072 13.0514 28.1984 12.348 27.4708C11.6447 26.7432 11.2495 25.7563 11.2495 24.7273V23.7574" stroke="black" stroke-width="1.00189" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                            </div>
                        </Popover.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <Popover.Panel className="dropdown-menu absolute right-0 z-50 mt-3 px-3 sm:px-0 h-[100%] w-screen max-w-md origin-top-right  rounded-md bg-white shadow-lg focus:outline-none">
                                <div className="overflow-hidden rounded-lg shadow-lg ring-opacity-5">
                                    <h3 className="px-6 py-3 font-medium text-left text-gray-900 bg-blue-300">
                                        Notification
                                    </h3>
                                    {notificationData?.notifications?.length === 0 ? (
                                        <div className="relative grid max-h-[300px] items-center justify-center gap-6 overflow-y-auto bg-white  px-5 py-6 text-center sm:gap-8 sm:p-8">
                                            <div className="font-medium text-center text-gray-700">
                                                <div className="flex justify-center font-medium text-center text-gray-700">
                                                    <BellAlertIcon className="w-8 h-8 text-gray-400" />
                                                </div>
                                                - No Notification Found -
                                            </div>
                                        </div>
                                    ) : (

                                        <div className="relative grid max-h-[300px] gap-6 overflow-y-auto  bg-white px-5 py-6 sm:gap-8 sm:p-8">
                                            {notificationData?.notifications?.map(
                                                (item: any, index: number) => (
                                                    <NotificationItem item={item} key={index} />
                                                )
                                            )}
                                        </div>

                                    )}
                                    <div className="px-5 py-3 space-y-6 bg-white sm:flex sm:space-y-0 sm:space-x-10 sm:px-8">
                                        <div className="flex w-full">
                                            {notificationData?.unreadNotificationsCount > 0 && (
                                                <Link
                                                    href={route("notification.mark-as-read")}
                                                    as="button"
                                                    method="post"
                                                    className="flex items-center justify-start w-full text-sm font-medium text-blue-500 hover:text-blue-400"
                                                >
                                                    Mark All As Read
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </Popover.Panel>
                        </Transition>
                    </>
                )}
            </Popover>
        </>
    );
}

export function NotificationItem({ item }: { item: any }) {
    return (
        <>
            <div className="flex items-center justify-between p-1 py-1 -m-3 transition duration-150 ease-in-out rounded-lg">

                <div className="flex items-center justify-between w-full py-1 border-b-2 border-gray-200 border-opacity-50">
                    <div className="flex items-center gap-2 ml-4">
                        <div className="w-2 h-2 p-1 bg-blue-500 rounded-full" />
                        <p className="text-sm font-medium ">{item?.data?.message}</p>
                    </div>
                    <div className="w-[150px] text-end text-xs font-medium text-gray-400">
                        {new Date(item?.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>

                <Link
                    href={route("notification.delete", {
                        id: item?.id,
                    })}
                    as="button"
                    method="post"
                    className="flex items-center justify-center ml-6 text-sm font-medium text-red-500 rounded-full w-fit h-fit focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:bg-red-500 hover:text-white"
                >
                    <XMarkIcon className="w-6 h-6 p-1" aria-hidden="true" />
                </Link>
            </div>
        </>
    );
}
