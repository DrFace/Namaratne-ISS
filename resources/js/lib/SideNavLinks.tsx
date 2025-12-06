import NavItem from '@/Components/shared/AdminSidebar/partials/NavItem';
import { usePage, router } from '@inertiajs/react';
import React from 'react';  // Import React
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const SideNavLinks: React.FC = () => {
    const { openTicketCount }: any = usePage().props;

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const navigationLinks = [
        { name: "Dashboard", link: false, border: false },
        {
            name: "Dashboard",
            link: true,
            border: false,
            startWith: "/dashboard",
            route: "dashboard", // ⚠ comment karala
            icon: "ChartPieIcon",
            count: 0,
        },
        {
            name: "Inventory",
            link: true,
            border: false,
            startWith: "/inventory",
            route: "products.index", // ✅ match Laravel route name
            icon: "ArchiveBoxIcon",
            count: 0,
        },

        {
            name: "Reports",
            link: true,
            border: false,
            startWith: "/",
            // route: "admin.reports", // ⚠ comment karala
            icon: "DocumentChartBarIcon",
            count: 0,
        },
        {
            name: "User Role Management",
            link: true,
            border: false,
            startWith: "/admin/users",
            route: "users.index",
            icon: "UsersIcon",
            count: 0,
        },
        {
            name: "Manage User Access",
            link: true,
            border: false,
            startWith: "/admin/permissions",
            route: "permissions.index",
            icon: "KeyIcon",
            count: 0,
        },
        {
            name: "Customers",
            link: true,
            border: false,
            startWith: "/customer",
            route: "customer.index", // ⚠ comment karala
            icon: "UserGroupIcon",
            count: 0,
        },
        {
            name: "Billing",
            link: true,
            border: false,
            startWith: "/billing",
            route: "billing.index", // ⚠ comment karala
            icon: "CurrencyDollarIcon",
            count: 0,
        },
        {
            name: "Settings",
            link: true,
            border: false,
            startWith: "/",
            // route: "admin.settings", // ⚠ comment karala
            icon: "Cog6ToothIcon",
            count: 0,
        },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1">
                {navigationLinks.map((item: any, index: number) => (
                    <NavItem
                        key={item.name + index}
                        name={item.name}
                        routeName={item.route ? route(item.route) : "#"} // comment walata fallback "#"
                        startWith={item.startWith}
                        icon={item.icon}
                        link={item.link}
                        count={item.count}
                        border={item.border}
                        children={item.children}
                    />
                ))}
            </div>

            {/* Logout Button */}
            <div className="mt-auto pt-4 pb-4 border-t border-gray-300">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-600" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default SideNavLinks;
