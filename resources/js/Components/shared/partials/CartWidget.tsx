import { Popover, Transition } from "@headlessui/react";
import { XMarkIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Fragment, useState } from "react";

export function CartWidget({}: {}) {
    const { minCartData }: any = usePage().props;

    return (
        <>
            <Popover className="relative ">
                {() => (
                    <>
                        <Popover.Button
                            className={
                                " flex items-center relative focus:border-none focus:ring-0 focus:outline-none"
                            }
                        >
                            <div
                                className="relative items-center w-6 h-6 hover:text-primary focus:border-none focus:ring-0 focus:outline-none"
                                data-toggle="tooltip"
                                data-placement="top"
                                title="My Bag"
                            >
                                <ShoppingBagIcon
                                    className="flex-shrink-0 w-full h-full focus:border-none focus:ring-0 focus:outline-none"
                                    aria-hidden="true"
                                />
                            </div>
                            {minCartData?.cartItems?.length > 0 && (
                                <div className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-center text-white bg-red-500 rounded-full -top-3 -right-3">
                                    {minCartData?.cartItemCount ?? 0}
                                </div>
                            )}
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
                            <Popover.Panel className="dropdown-menu absolute right-0 z-50 mt-3 h-[100%] w-screen max-w-md origin-top-right  rounded-md bg-white shadow-lg ">
                                <div className="overflow-hidden rounded-lg shadow-lg ">
                                    <h3 className="px-6 py-3 font-medium text-left text-gray-900 bg-gray-50">
                                        My Bag List
                                    </h3>
                                    {minCartData?.cartItems?.length == 0 ? (
                                        <div className="relative grid max-h-[300px] items-center justify-center gap-6 overflow-y-auto bg-white  px-5 py-6 text-center sm:gap-8 sm:p-8">
                                            <div className="font-medium text-center text-gray-700">
                                                <div className="flex justify-center font-medium text-center text-gray-700">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth="1"
                                                        stroke="currentColor"
                                                        className="w-10 h-10 text-center"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                                                        />
                                                    </svg>
                                                </div>
                                                - Your Bag Is Empty -
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative grid max-h-[300px] gap-6 overflow-y-auto  bg-white px-5 py-6 sm:gap-8 sm:p-8">
                                            {minCartData?.cartItems?.map(
                                                (item: any, index: number) => (
                                                    <CartItem item={item} key={index} />
                                                )
                                            )}
                                        </div>
                                    )}
                                    <div className="px-5 py-3 space-y-6 bg-gray-50 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8">
                                        <div className="flex w-full">
                                            <Link
                                                href={"/cart"}
                                                className="flex items-center px-3 py-2 mx-auto text-base font-medium text-white transition duration-150 ease-in-out bg-gray-700 rounded-lg hover:bg-primary"
                                            >
                                                <ShoppingBagIcon
                                                    className="flex-shrink-0 w-6 h-6 "
                                                    aria-hidden="true"
                                                />
                                                <span className="ml-3">
                                                    Go to bag
                                                </span>
                                            </Link>
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

export function CartItem({ item }: { item: any }) {
    const { data, setData, post, progress,  reset, get } = useForm({
        qty: item?.qty,
    });
    const min = 1;
    const max =
        item?.item_type == "variation"
            ? item?.item?.stock
            : item?.item?.base_stock;

    function handleChange(key: any, value: any) {
        const inputValue = Math.max(min, Math.min(max, Number(value)));
        setData((data) => ({
            ...data,
            [key]: inputValue,
        }));

        post(
            route("cart.qty.change", {
                id: item?.id,
                inputValue: inputValue,
            })
        );
    }

    return (
        <>
            <div className="flex items-center justify-between p-3 py-3 -m-3 transition duration-150 ease-in-out rounded-lg hover:bg-gray-50">
                <Link
                    {...(item?.item_type === "variation"
                        ? {
                              href: route("products.filter.show", {
                                  slug: item?.item?.product?.slug,
                                  params: item?.item_id,
                              }),
                          }
                        : {
                              href: route(
                                  "products.filter.show",
                                  item?.item?.slug
                              ),
                          })}
                >
                    <div className="flex items-center">
                        <img
                            sizes="100%"
                            src={item?.item?.main_image?.url}
                            alt={"item image"}
                            className="object-contain w-12 h-12 rounded-md"
                            width={36}
                            height={36}
                        />
                        <div className="ml-4 text-left">
                            <div className="text-sm font-medium text-gray-900">
                                <span className="text-primary">
                                    {item?.item_type == "variation"
                                        ? item?.item?.product?.name
                                        : item?.item?.name}
                                </span>
                                <br />
                                {item?.item_type == "variation"
                                    ? item?.item?.product?.brand?.name
                                    : item?.item?.brand?.name}
                                <br />
                                {item?.item_type == "variation" && (
                                    <span className="text-xs text-gray-600">
                                        {item?.item?.variation_details}
                                    </span>
                                )}
                            </div>

                        </div>
                    </div>
                </Link>
                <Link
                    href={route("cart.destroy", {
                        id: item?.id,
                    })}
                    as="button"
                    method="delete"
                    className="flex items-center justify-center ml-6 text-sm font-medium text-red-500 rounded-full w-fit h-fit focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:bg-red-500 hover:text-white"
                >
                    <XMarkIcon className="w-6 h-6 p-1" aria-hidden="true" />
                </Link>
            </div>
        </>
    );
}
