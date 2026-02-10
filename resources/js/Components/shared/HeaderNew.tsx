import { Fragment, useEffect, useState } from "react";
import { Dialog, Popover, Tab, Transition } from "@headlessui/react";
import {
    ArrowRightCircleIcon,
    Bars3Icon,
    ChevronDoubleDownIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link, usePage } from "@inertiajs/react";
import DarkModeToggle from '../DarkModeToggle';
import { useGlobalShortcuts } from '../../hooks/useKeyboardShortcuts';

import HeaderSearch from "./HeaderSearch";
import Dropdown from "../elements/other/Dropdown";


const navigation = {
    pages: [
        {
            name: "Log in",
            href: route("login"),
            startsWith: "/login",
            isMalty: false,
        },
        {
            name: "Sign up",
            href: route("register"),
            startsWith: "/register",
            isMalty: false,
        },
        // {
        //     name: "Contact Us",
        //     href: route("contact.index"),
        //     startsWith: "/contact-us",
        //     isMalty: false,
        // },
    ],
};

function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
}

export default function HeaderNew({ appName }: { appName: string }) {
    // Activate global keyboard shortcuts
    useGlobalShortcuts();
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    let { url }: any = usePage();
    if (url == '/' || url.includes('/?category')) {
        url = '/home'
    }
    //console.log(url)

    const [opacity, setOpacity] = useState(25);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setOpacity(100);
            //     setIsVisible(true);
            // If scrolled beyond 300 pixels, set opacity to 100
            // if (scrollPosition > 300) {
            //     setOpacity(100);
            //     setIsVisible(true); // Set to visible if scrolled beyond 300 pixels
            // } else {
            //     // Otherwise, smoothly transition from 25 to 100 based on scroll position
            //     setOpacity(Math.max(25 + (scrollPosition / 300) * 75, 0));

            //     // Hide the element after starting to scroll
            //     setIsVisible(scrollPosition <= 0);
            // }
        };

        // Attach the event listener when the component mounts
        window.addEventListener('scroll', handleScroll);

        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen((prevState) => !prevState);
    };


    return (
        <>
            <Transition.Root show={mobileMenuOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-40 lg:hidden"
                    onClose={setMobileMenuOpen}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-40 flex ">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative flex flex-col w-full max-w-xs pb-12 overflow-y-auto bg-white shadow-xl">
                                <div className="flex px-4 pt-5 pb-2">
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center p-2 -m-2 text-gray-400 rounded-md"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="sr-only">
                                            Close menu
                                        </span>
                                        <XMarkIcon
                                            className="w-6 h-6"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                                <div className="px-4 py-6 space-y-6 ">
                                    {navigation?.pages?.map((page :any) => (
                                        <div
                                            key={page?.name}
                                            className="flow-root"
                                        >
                                            <Link
                                                href={page?.href}
                                                className={` ${url?.startsWith(
                                                    page?.startsWith
                                                )
                                                    ? " text-primary-600 "
                                                    : " text-gray-900 hover:text-primary-600  "
                                                    }  -m-2 block p-2 font-medium `}
                                            >
                                                {page?.name}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <header className="sticky top-0 left-0 right-0 z-10 ">
                <nav aria-label="Top">
                    {/*navigation */}
                    <div className={`absolute top-0 left-0 w-full  bg-white  ${isVisible ? '' : 'hidden'}`}>
                        <div className="px-6 py-4 ">
                            <div>
                                <div className="flex items-center justify-between h-auto">
                                    <div className="relative lg:w-1/5 ">
                                        <Link href={route("home")} className="hidden lg:flex">
                                            <img
                                                className="h-[46px] w-auto object-contain"
                                                src="/assets/images/logo-short.png?a=234"
                                                alt={appName}
                                            />
                                        </Link>


                                        <Link
                                            href={route("home")}
                                            className="lg:hidden"
                                        >
                                            <span className="sr-only">
                                                {appName}
                                            </span>
                                            <img
                                                src="/assets/images/logo-short.png?a=234"
                                                alt={appName}
                                                className="w-auto h-10"
                                            />
                                        </Link>
                                    </div>



                                    {/* <div className="relative lg:w-[700px] flex justify-end">
                                        {navigation?.pages?.map((page: any) => (
                                            <div key={page.id} className="text-center ">
                                                {page?.isMalty ? (
                                                    <Dropdown>
                                                        <Dropdown.Trigger>
                                                            <button
                                                                // className="items-center flex-1 hidden text-sm font-semibold leading-6 text-gray-900 gap-x-1 lg:flex"
                                                                className={` ${url.startsWith(
                                                                    page.startsWith
                                                                )
                                                                    ? " text-primary-600 border-primary"
                                                                    : " text-gray-900 hover:text-primary-600 border-transparent hover:border-primary "
                                                                    }  -m-2 p-2  border-b-2 items-center flex-1 hidden text-sm font-semibold leading-6 text-gray-900 gap-x-1 lg:flex`}
                                                            >

                                                                {page?.name}
                                                                <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                                                            </button>
                                                        </Dropdown.Trigger>
                                                        <Dropdown.Content>
                                                            {1 < 2 ? (
                                                                page?.maltyLinks.map((item: any) => (
                                                                    <Dropdown.Link key={item.id} href={item.href}>
                                                                        {item.name}
                                                                    </Dropdown.Link>
                                                                ))
                                                            ) : null}
                                                        </Dropdown.Content>
                                                    </Dropdown>
                                                ) : (
                                                    <Link
                                                        href={page?.href}
                                                        className={` ${url?.startsWith(
                                                            page?.startsWith
                                                        )
                                                            ? " text-white bg-primaryBtnColor text-md font-Inter font-medium hover:bg-primaryBtnColorHover px-8 py-3 rounded-full"
                                                            : " text-black hover:text-primary-600 text-md font-Inter font-medium bg-transparent px-8 py-3  hover:text-primary rounded-full"
                                                            }  hidden text-sm font-semibold leading-6 text-gray-900 lg:flex `}
                                                    >
                                                        {page?.name}
                                                    </Link>
                                                )}
                                            </div>
                                        ))}



                                    </div> */}


                                    {/* Desktop dark mode toggle */}
                                    <div className="hidden lg:flex items-center gap-4">
                                        <DarkModeToggle />
                                    </div>

                                    {/* Mobile menu and search (lg-) */}
                                    <div className="flex items-center justify-end flex-1 gap-3 lg:hidden">
                                        <DarkModeToggle />
                                        <button
                                            type="button"
                                            className="p-2 -ml-2 text-black dark:text-white"
                                            onClick={() =>
                                                setMobileMenuOpen(true)
                                            }
                                        >
                                            <span className="sr-only">
                                                Open menu
                                            </span>
                                            <Bars3Icon
                                                className="w-6 h-6"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header >
        </>
    );
}
