import { usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import MasterTable, { TableTd } from "@/Components/elements/tables/masterTable";
import CreateCustomerModal from "./CreateCustomerModal";
import { PencilIcon } from "@heroicons/react/20/solid";
import {
    LockClosedIcon,
    TrashIcon,
    CurrencyDollarIcon,
    ClockIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import ConfirmButton from "@/Components/elements/buttons/ConfirmButton";
import { PrimaryLink } from "@/Components/elements/buttons/PrimaryButton";
import EditCustomerModal from "./EditCustomerModal";
import axios from "axios";
import { toast } from "react-toastify";

export default function CustomersIndexPage() {
    const {
        customers: pageCustomers,
        permissions,
        isAdmin,
        filters: serverFilters,
    } = usePage().props as any;

    // IMPORTANT: keep local state for instant UI updates (settle credit), but sync with new props
    const [customers, setCustomers] = useState(pageCustomers);

    useEffect(() => {
        setCustomers(pageCustomers);
    }, [pageCustomers]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [searchText, setSearchText] = useState<string>(
        serverFilters?.search || "",
    );
    const [startDate, setStartDate] = useState<string>(
        serverFilters?.start_date || "",
    );
    const [endDate, setEndDate] = useState<string>(
        serverFilters?.end_date || "",
    );

    const filters = {}; // keep as-is for MasterTable
    const createLink = undefined; // or route("products.create")

    // Helper function to check permissions
    const hasPermission = (permission: string) => {
        if (isAdmin) return true;
        return permissions && permissions.includes(permission);
    };

    const canAddCustomer = hasPermission("add_customers");

    const handleCustomerCreated = (newCustomer: any) => {
        setCustomers({ ...customers, data: [...customers.data, newCustomer] });
    };

    const handleCustomerUpdated = (updated: any) => {
        setCustomers({
            ...customers,
            data: customers.data.map((c: any) =>
                c.id === updated.id ? updated : c,
            ),
        });
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const openEditModal = (customer: any) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const applyFilters = () => {
        router.get(
            route("customer.index"),
            {
                search: searchText?.trim() || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            },
            // preserveState can be true, but our useEffect ensures data updates
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearchText("");
        setStartDate("");
        setEndDate("");

        router.get(
            route("customer.index"),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleSettleCredit = async (customer: any) => {
        const outstanding = Number(customer.currentCreditSpend || 0);

        if (outstanding <= 0) {
            toast.info("No outstanding credit to settle");
            return;
        }

        const input = window.prompt(
            `Enter settlement amount (Max: Rs. ${outstanding.toLocaleString()}):`,
            String(outstanding),
        );

        if (input === null) return;

        const amount = Number(String(input).replace(/,/g, "").trim());

        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error("Please enter a valid amount greater than 0");
            return;
        }

        if (amount > outstanding) {
            toast.error("Settlement amount cannot exceed outstanding credit");
            return;
        }

        const confirmed = window.confirm(
            `Confirm settlement?\n\nCustomer: ${customer.name}\nSettle Amount: Rs. ${amount.toLocaleString()}\nOutstanding Before: Rs. ${outstanding.toLocaleString()}\nOutstanding After: Rs. ${(outstanding - amount).toLocaleString()}`,
        );

        if (!confirmed) return;

        try {
            const response = await axios.post(
                `/customer/${customer.id}/settle-credit`,
                { amount },
            );

            const updatedCustomer = response.data.customer;

            setCustomers({
                ...customers,
                data: customers.data.map((c: any) =>
                    c.id === customer.id ? { ...c, ...updatedCustomer } : c,
                ),
            });

            toast.success(
                response.data.message || "Credit settled successfully",
            );
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Error settling credit",
            );
        }
    };

    const tableColumns = [
        { label: "ID", sortField: "id", sortable: true },
        { label: "Name", sortField: "name", sortable: true },
        { label: "Contact", sortField: "contactNumber", sortable: true },
        { label: "Credit Limit", sortField: "creditLimit", sortable: true },
        { label: "Total Sales", sortField: "totalSales", sortable: true },
        { label: "To Settle", sortField: "currentCreditSpend", sortable: true },
        { label: "Credit Status", sortField: "", sortable: false },
        { label: "Status", sortField: "status", sortable: true },
        { label: "", sortField: "", sortable: false },
        { label: "", sortField: "", sortable: false },
        { label: "", sortField: "", sortable: false },
    ];

    return (
        <Authenticated>
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Customers</h2>
                    <div className="relative group">
                        <button
                            onClick={() =>
                                canAddCustomer && setIsModalOpen(true)
                            }
                            disabled={!canAddCustomer}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                canAddCustomer
                                    ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {!canAddCustomer && (
                                <LockClosedIcon className="w-4 h-4" />
                            )}
                            Add Customer
                        </button>
                        {!canAddCustomer && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                You don't have permission to add customers
                            </div>
                        )}
                    </div>
                </div>

                {/* Search + Date Range Filter (affects Total Sales) */}
                <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end">
                        <div className="lg:col-span-2">
                            <label className="text-xs text-gray-600 mb-1 block">
                                Search
                            </label>
                            <input
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") applyFilters();
                                }}
                                placeholder="Search by name / contact / email"
                                className="border rounded-lg px-3 py-2 text-sm w-full"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-600 mb-1 block">
                                From
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-600 mb-1 block">
                                To
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={applyFilters}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition w-full"
                            >
                                Apply
                            </button>
                            <button
                                onClick={resetFilters}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition w-full"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                        Date range affects <b>Total Sales</b> (approved sales
                        only) shown in the table.
                    </div>
                </div>

                <MasterTable
                    tableColumns={tableColumns}
                    filters={filters}
                    url={route("customer.index")}
                    createLink={createLink}
                    links={customers?.meta?.links}
                    hideDateRange={true}
                >
                    {customers.data.map((c: any) => (
                        <tbody key={c.id} className="bg-white">
                            <tr>
                                <TableTd>{c.id}</TableTd>
                                <TableTd>{c.name}</TableTd>
                                <TableTd>{c.contactNumber}</TableTd>
                                <TableTd>
                                    Rs.{" "}
                                    {Number(
                                        c.creditLimit || 0,
                                    ).toLocaleString()}
                                </TableTd>
                                <TableTd>
                                    Rs.{" "}
                                    {Number(c.totalSales || 0).toLocaleString()}
                                </TableTd>

                                <TableTd>
                                    <span
                                        className={`font-semibold ${
                                            Number(c.currentCreditSpend || 0) >
                                            0
                                                ? "text-red-600"
                                                : "text-green-700"
                                        }`}
                                    >
                                        Rs.{" "}
                                        {Number(
                                            c.currentCreditSpend || 0,
                                        ).toLocaleString()}
                                    </span>
                                </TableTd>

                                <TableTd>
                                    {c.canPurchase === false ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <ClockIcon className="w-4 h-4" />
                                            Period Expired
                                        </span>
                                    ) : c.creditPeriodExpiresAt ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            <ClockIcon className="w-4 h-4" />
                                            {Math.max(
                                                0,
                                                Math.floor(
                                                    (new Date(
                                                        c.creditPeriodExpiresAt,
                                                    ).getTime() -
                                                        Date.now()) /
                                                        (1000 * 60 * 60 * 24),
                                                ),
                                            )}{" "}
                                            days left
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Good
                                        </span>
                                    )}
                                </TableTd>

                                <TableTd>{c.status}</TableTd>

                                <TableTd>
                                    <button
                                        onClick={() => openEditModal(c)}
                                        disabled={
                                            !hasPermission("edit_customers")
                                        }
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                            hasPermission("edit_customers")
                                                ? "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Edit
                                    </button>
                                </TableTd>

                                <TableTd>
                                    <button
                                        onClick={() =>
                                            Number(c.currentCreditSpend || 0) >
                                                0 && handleSettleCredit(c)
                                        }
                                        disabled={
                                            !hasPermission("edit_customers") ||
                                            Number(c.currentCreditSpend || 0) <=
                                                0
                                        }
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                            hasPermission("edit_customers") &&
                                            Number(c.currentCreditSpend || 0) >
                                                0
                                                ? "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                    >
                                        <CurrencyDollarIcon className="w-4 h-4" />
                                        {Number(c.currentCreditSpend || 0) > 0
                                            ? "Settle Credit"
                                            : "All Settled"}
                                    </button>
                                </TableTd>

                                <TableTd>
                                    <button
                                        onClick={() => {
                                            if (
                                                !hasPermission(
                                                    "delete_customers",
                                                )
                                            )
                                                return;
                                            if (
                                                window.confirm(
                                                    "Are you sure you want to delete this customer?",
                                                )
                                            ) {
                                                fetch(`/customer/${c.id}`, {
                                                    method: "DELETE",
                                                    headers: {
                                                        "X-CSRF-TOKEN":
                                                            document
                                                                .querySelector(
                                                                    'meta[name="csrf-token"]',
                                                                )
                                                                ?.getAttribute(
                                                                    "content",
                                                                ) || "",
                                                    },
                                                }).then(() =>
                                                    window.location.reload(),
                                                );
                                            }
                                        }}
                                        disabled={
                                            !hasPermission("delete_customers")
                                        }
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                            hasPermission("delete_customers")
                                                ? "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </button>
                                </TableTd>
                            </tr>
                        </tbody>
                    ))}
                </MasterTable>

                <CreateCustomerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCreated={handleCustomerCreated}
                    permissions={permissions}
                    isAdmin={isAdmin}
                />
                <EditCustomerModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    customer={selectedCustomer}
                    onUpdated={handleCustomerUpdated}
                    permissions={permissions}
                    isAdmin={isAdmin}
                />
            </div>
        </Authenticated>
    );
}
