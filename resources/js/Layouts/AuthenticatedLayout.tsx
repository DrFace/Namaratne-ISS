import FlashAlerts from "@/Components/elements/alerts/FlashAlerts";
import AdminHeader from "@/Components/shared/AdminHeader";
import AdminSidebar from "@/Components/shared/AdminSidebar/AdminSideBar";
import { usePage } from "@inertiajs/react";
import { ReactNode } from "react";
import { PageProps } from "@/types";
import HelpModal from "@/Components/UI/HelpModal";
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function Authenticated({
    children,
    bRoutes,
}: {
    children: ReactNode;
    header?: React.ReactNode;
    bRoutes?: any;
}) {
    useGlobalShortcuts();
    const pageProps = usePage().props;
    const { user }: any = pageProps.auth;
    const { flash, auth } = usePage<PageProps>().props;
    return (
        <>
            <div
                className={" min-h-[100vh] h-full scroll-smooth bg-gray-50 dark:bg-gray-950 transition-colors duration-300 "}
            >
                <AdminHeader bRoutes={bRoutes} user={user} />
                <div className="relative h-full pb-10 lg:mt-[85px]">
                    <AdminSidebar user={user} />
                    <div className="flex flex-1 flex-col lg:pl-[260px] h-full min-h-[100vh]">
                        <main className="container flex-1 p-4 md:p-8 mx-auto bg-transparent sm:py-8 lg:p-8">
                            {children}
                        </main>
                    </div>
                </div>
                <FlashAlerts flash={flash ?? {}} />
                <HelpModal />
                </div>
        </>
    );
}
