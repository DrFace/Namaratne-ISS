import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Link, usePage } from "@inertiajs/react";

export default function HeaderDropdown({ sticky }: { sticky: string }) {
    const { navCollection }: any = usePage().props;
    const { url }: any = usePage();
    const show =
        sticky == "show"
            ? "show"
            : url != "/" && url != "/products"
            ? "show"
            : "hidden";
    return (
        <Popover
            className={` ${show} relative mt-5 items-center text-sm font-medium  transition-all duration-300 `}
        >
            <Popover.Button className="inline-flex items-center text-sm font-semibold leading-6 text-gray-900 gap-x-1">
                <span>Categories</span>
                <ChevronDownIcon className="w-5 h-5" aria-hidden="true" />
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
                <Popover.Panel className="absolute z-10 flex w-screen px-4 mt-5 -translate-x-1/2 left-1/2 max-w-max">
                    <div className="w-screen max-w-[220px] flex-auto overflow-hidden  bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                        {/* <div className="flex flex-col text-sm divide-y divide-gray-100 divide-solid">
                            {navCollection?.map((category: any) => (
                                <Link
                                    key={category.slug + "cat"}
                                    className="px-6 py-3 hover:bg-gray-50 hover:font-[800]"
                                    href={
                                        route("products.filter") +
                                        `?categories=${category.slug}`
                                    }
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div> */}
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    );
}
