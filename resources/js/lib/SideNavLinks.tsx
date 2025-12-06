import NavItem from '@/Components/shared/AdminSidebar/partials/NavItem';
import { usePage } from '@inertiajs/react';
import React from 'react';  // Import React

const SideNavLinks: React.FC = () => {
    const { openTicketCount }: any = usePage().props;

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
        <div>
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
    );
};

export default SideNavLinks;
