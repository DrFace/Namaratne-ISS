import { FC } from "react";
import NavItem from "./partials/NavItem";
import { User } from "@/types";
import SideNavLinks from "@/lib/SideNavLinks";
import { useUIStore } from "@/store/uiStore";


interface ISidebar {
    user: User;
}

const Sidebar: FC<ISidebar> = ({ user }) => {
    const { sidebarOpen, setSidebarOpen } = useUIStore();

    return (
        <>
            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-[80px] lg:flex lg:w-[260px] lg:flex-col h-screen fixed left-0 top-0 bottom-0">
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="sticky flex flex-col flex-grow pt-0 pb-32 pl-4 pr-3 overflow-y-auto bg-slate-200">
                    <nav
                        className="sticky flex flex-col flex-1 overflow-revert scrollbar-track-rounded-full scrollbar-thumb-rounded-full overscroll-auto scroll-smooth scrollbar-thin "
                        aria-label="Sidebar"
                    >
                        <div className="pt-8">
                            {/* {navigationLinks.map((item: any, index: number) => (
                                <NavItem
                                    key={item.name + index}
                                    name={item.name}
                                    routeName={route(item.route)}
                                    startWith={item.startWith}
                                    icon={item.icon}
                                    link={item.link}
                                    border={item.border}
                                    children={item.children}
                                />
                            ))} */}
                              <SideNavLinks/>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
};
export default Sidebar;
