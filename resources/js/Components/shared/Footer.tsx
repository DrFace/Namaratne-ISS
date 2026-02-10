import { usePage } from "@inertiajs/react";



export default function Footer() {
    const { footerCollection }: any = usePage().props;

    const { auth } = usePage().props;
    const user = (auth as { user?: any }).user;

    const footerNavigation = {
        client: [
            // { name: "How to hire", href: route("home") },
            // { name: "Talent Marketplace", href: route("home") },
            // { name: "Project Catalog", href: route("home") },
            // { name: "Any Hire", href: route("home") },
        ],
        talent: [
            // { name: "How to find work", href: route("home") },
            // { name: "Direct Contracts", href: route("home") },
            // { name: "Find freelance jobs worldwide", href: route("home") },
        ],
        company: [
            !user ? { name: "Home", href: route("home") } : user?.user_type=='client' ? { name: "Dashboard", href: route("client.home") } : { name: "Dashboard", href: route("freelancer.dashboard") },
            // { name: "Home", href: route("home") },
            { name: "About Us", href: route("about.index") },
            // { name: "Investor relations", href: route("home") },
            // { name: "Careers", href: route("home") },
            { name: "Contact Us", href: route("contact.index") },
        ],
        OtherLinks: [
            { name: "Terms of Service ", href: route("terms-of-service.index") },
            { name: "Privacy Policy", href: route("privacy-policy.index") },
            //  { name: "CA Notice at Collection ", href: route("home") },
            // { name: "Cookie Settings", href: route("home") },
            // { name: "Accessibility", href: route("home") },
        ],
        social: [
            {
                name: "Facebook",
                href: "#",
                icon: (props: any) => (
                    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                        <path
                            fillRule="evenodd"
                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                            clipRule="evenodd"
                        />
                    </svg>
                ),
            },
            {
                name: "Instagram",
                href: "#",
                icon: (props: any) => (
                    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                        <path
                            fillRule="evenodd"
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                            clipRule="evenodd"
                        />
                    </svg>
                ),
            },
            {
                name: "LinkedIn",
                href: "#",
                icon: (props: any) => (
                    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                        <path
                            fillRule="evenodd"
                            d="M 6 3 C 4.3550302 3 3 4.3550302 3 6 L 3 18 C 3 19.64497 4.3550302 21 6 21 L 18 21 C 19.64497 21 21 19.64497 21 18 L 21 6 C 21 4.3550302 19.64497 3 18 3 L 6 3 z M 6 5 L 18 5 C 18.56503 5 19 5.4349698 19 6 L 19 18 C 19 18.56503 18.56503 19 18 19 L 6 19 C 5.4349698 19 5 18.56503 5 18 L 5 6 C 5 5.4349698 5.4349698 5 6 5 z M 8.1855469 6.7851562 C 7.4445469 6.7851563 7 7.2293594 7 7.8183594 C 7 8.4113594 7.444375 8.8574219 8.109375 8.8574219 C 8.850375 8.8574219 9.2910156 8.4113594 9.2910156 7.8183594 C 9.2910156 7.2303594 8.8505469 6.7851562 8.1855469 6.7851562 z M 7.0625 9.9628906 L 7.0625 16 L 9.2363281 16 L 9.2363281 9.9628906 L 7.0625 9.9628906 z M 11.033203 9.9628906 L 11.033203 16 L 13.207031 16 L 13.207031 12.697266 C 13.207031 11.718266 13.908141 11.574219 14.119141 11.574219 C 14.330141 11.574219 14.892578 11.785266 14.892578 12.697266 L 14.892578 16 L 17 16 L 17 12.697266 C 17 10.806266 16.154516 9.9628906 15.103516 9.9628906 C 14.052516 9.9628906 13.490031 10.312641 13.207031 10.806641 L 13.207031 9.9628906 L 11.033203 9.9628906 z"
                            clipRule="evenodd"
                        />
                    </svg>
                ),
            },
            // {
            //     name: "Twitter",
            //     href: "#",
            //     icon: (props: any) => (
            //         <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            //             <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            //         </svg>
            //     ),
            // },
            // {
            //     name: "YouTube",
            //     href: "#",
            //     icon: (props: any) => (
            //         <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            //             <path
            //                 fillRule="evenodd"
            //                 d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            //                 clipRule="evenodd"
            //             />
            //         </svg>
            //     ),
            // },
        ],
    };

    const date = new Date();
    return (
        <footer aria-labelledby="footer-heading" className="px-6 pb-6 bg-white ">
            <div className="p-10 lg:p-24 bg-footerColor rounded-xl">
                <h2 id="footer-heading" className="sr-only">
                    Footer
                </h2>
                <div className=" max-w-7xl">
                    <div className="mb-10 xl:grid xl:grid-cols-6 xl:gap-8">

                        <div className="col-span-4 space-y-8 md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
                            {/* <div>
                                <h3 className="text-lg font-medium text-white">
                                    For Clients
                                </h3>
                                <ul role="list" className="mt-6 space-y-2">
                                    {footerNavigation?.client?.map((item: any) => (
                                        <li key={item?.name} className="text-sm">
                                            <a
                                                href={item?.href}
                                                className="text-gray-300 hover:text-white"
                                            >
                                                {item?.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div> */}
                            {/* <div>
                                <h3 className="text-lg font-medium text-white">
                                    For Talent
                                </h3>
                                <ul role="list" className="mt-6 space-y-2">
                                    {footerNavigation?.talent?.map((item: any) => (
                                        <li key={item?.name} className="text-sm">
                                            <a
                                                href={item?.href}
                                                className="text-gray-300 hover:text-white"
                                            >
                                                {item?.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div> */}
                            <div>
                                <h3 className="text-lg font-medium text-white">
                                    Company
                                </h3>
                                <ul role="list" className="mt-6 space-y-2">
                                    {footerNavigation.company.map((item) => (
                                        <li key={item.name} className="text-sm">
                                            <a
                                                href={item.href}
                                                className="text-gray-300 hover:text-white"
                                            >
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="lg:hidden ">
                                <h3 className="text-lg font-medium text-white">
                                    Other Links
                                </h3>
                                <ul role="list" className="mt-6 space-y-2">
                                    {footerNavigation.OtherLinks.map((item) => (
                                        <li key={item.name} className="text-sm">
                                            <a
                                                href={item.href}
                                                className="text-gray-300 hover:text-white"
                                            >
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="col-span-2 space-y-8">
                            {/* <img
                            className="h-20"
                            src="/assets/images/logo-short.png?a=1"
                            alt="Woxbond"
                        />
                        <p className="text-sm leading-6 text-gray-300">
                            Making the world a better place through constructing
                            elegant hierarchies.
                        </p> */}

                        </div>
                    </div>
                    <div className="space-y-5">
                        <div className="flex space-x-6">
                            <span className="hidden text-white md:flex">Follow us</span>
                            {footerNavigation.social.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-500 hover:text-gray-400"
                                >
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                    />
                                </a>
                            ))}
                        </div>

                        <div className="flex flex-row gap-5 pt-5 text-center border-t border-gray-800 sm:text-left">
                            <p className="mr-6 space-x-2 text-sm text-gray-400 font-Inter">
                                <span>
                                    &copy; {date.getFullYear()} Ai-geeks. All rights reserved.
                                </span>
                                {/* <span>
                                    Developed By{" "}
                                    <a
                                        target="_blank"
                                        href="https://axcertro.com"
                                        className="font-[800]"
                                    >
                                        Axcertro
                                    </a>{" "}
                                    <span>With ❤️</span>
                                </span> */}


                            </p>

                            <div className="hidden space-x-6 lg:flex">
                                {footerNavigation.OtherLinks.map((item) => (

                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={item.href}
                                        className="text-sm text-gray-300 font-Inter hover:text-white"
                                    >
                                        {item.name}
                                    </a>

                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
