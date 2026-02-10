import { usePage } from "@inertiajs/react";
import React from "react";
import Header from "../Components/shared/Header";
import HeaderNew from "@/Components/shared/HeaderNew";
import Footer from "../Components/shared/Footer";
import FlashAlerts from "../Components/elements/alerts/FlashAlerts";
import { PageProps, FlashMessages } from "@/types";

interface AppLayoutProps {
    children: React.ReactNode;
    isFooter?: boolean;
    isHeader?: boolean;
    isCustomHeader?: boolean;
    isFreelancerHeader?: boolean;
    isClientHeader?: boolean;
}

export default function AppLayout({
    children,
    isFooter = true,
    isHeader = true,
    isCustomHeader = false,
    isFreelancerHeader = false,
    isClientHeader = false,
}: AppLayoutProps) {
    const appName = import.meta.env.VITE_APP_NAME || "Ai-geeks";

    const { flash, auth } = usePage<PageProps>().props;

    return (
        <div className="bg-white">
            {isHeader && !isCustomHeader && <Header appName={appName} />}
            {isCustomHeader && <HeaderNew appName={appName} />}
            <main className="-mt-20">{children}</main>
            {isFooter && <Footer />}
            <FlashAlerts flash={flash as FlashMessages} />
        </div>
    );
}
