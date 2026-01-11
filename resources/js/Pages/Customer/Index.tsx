import { usePage } from "@inertiajs/react";
import { useState } from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import MasterTable, { TableTd } from "@/Components/elements/tables/masterTable";
import CreateCustomerModal from "./CreateCustomerModal";
import { PencilIcon } from "@heroicons/react/20/solid";
import { LockClosedIcon, TrashIcon, CurrencyDollarIcon, ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import ConfirmButton from "@/Components/elements/buttons/ConfirmButton";
import { PrimaryLink } from "@/Components/elements/buttons/PrimaryButton";
import EditCustomerModal from "./EditCustomerModal";
import axios from "axios";
import { toast } from "react-toastify";

export default function CustomersIndexPage() {
    const { customers: initialCustomers, permissions, isAdmin } = usePage().props as any;
    const [customers, setCustomers] = useState(initialCustomers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const filters = {}; // currently empty
    const createLink = undefined; // or route("products.create")
    const search = { placeholder: "Search Customer" };

    // Helper function to check permissions
    const hasPermission = (permission: string) => {
        if (isAdmin) return true;
        return permissions && permissions.includes(permission);
    };

    const canAddCustomer = hasPermission('add_customers');

    const handleCustomerCreated = (newCustomer: any) => {
        setCustomers({ ...customers, data: [...customers.data, newCustomer] });
    };
    const handleCustomerUpdated = (updated: any) => {
        setCustomers({
            ...customers,
            data: customers.data.map((c: any) => (c.id === updated.id ? updated : c)),
        });
    };
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const openEditModal = (customer: any) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const handleSettleCredit = async (customer: any) => {
        const creditAmount = Number(customer.currentCreditSpend || 0);

        if (creditAmount <= 0) {
            toast.info("No outstanding credit to settle");
            return;
        }

        const confirmed = window.confirm(
            `Do you wish to mark this credit as settled?\n\nCustomer: ${customer.name}\nCredit Amount: Rs. ${creditAmount.toLocaleString()}`
        );

        if (!confirmed) return;

        try {
            const response = await axios.post(`/customer/${customer.id}/settle-credit`);

            // Update the local state
            setCustomers({
                ...customers,
                data: customers.data.map((c: any) =>
                    c.id === customer.id
                        ? { ...c, currentCreditSpend: 0 }
                        : c
                ),
            });

            toast.success(response.data.message || "Credit settled successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error settling credit");
        }
    };

    const tableColumns = [
        { label: "ID", sortField: "id", sortable: true },
        { label: "Name", sortField: "name", sortable: true },
        { label: "Contact", sortField: "contactNumber", sortable: true },
        { label: "Credit Limit", sortField: "creditLimit", sortable: true },
        { label: "Total Sales", sortField: "totalSales", sortable: true },
        { label: "Credit Status", sortField: "", sortable: false },
        { label: "Net Balance", sortField: "netBalance", sortable: true },
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
                            onClick={() => canAddCustomer && setIsModalOpen(true)}
                            disabled={!canAddCustomer}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${canAddCustomer
                                ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {!canAddCustomer && <LockClosedIcon className="w-4 h-4" />}
                            Add Customer
                        </button>
                        {!canAddCustomer && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                You don't have permission to add customers
                            </div>
                        )}
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
                                <TableTd>Rs. {Number(c.creditLimit || 0).toLocaleString()}</TableTd>
                                <TableTd>Rs. {Number(c.totalSales || 0).toLocaleString()}</TableTd>
                                <TableTd>
                                    {c.canPurchase === false ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <ClockIcon className="w-4 h-4" />
                                            Period Expired
                                        </span>
                                    ) : c.creditPeriodExpiresAt ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            <ClockIcon className="w-4 h-4" />
                                            {Math.max(0, Math.floor((new Date(c.creditPeriodExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Good
                                        </span>
                                    )}
                                </TableTd>
                                <TableTd>Rs. {Number(c.netBalance || 0).toLocaleString()}</TableTd>
                                <TableTd>{c.status}</TableTd>
                                <TableTd>
                                    <button
                                        onClick={() => openEditModal(c)}
                                        disabled={!hasPermission('edit_customers')}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${hasPermission('edit_customers')
                                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Edit
                                    </button>
                                </TableTd>
                                <TableTd>
                                    <button
                                        onClick={() => Number(c.currentCreditSpend || 0) > 0 && handleSettleCredit(c)}
                                        disabled={!hasPermission('edit_customers') || Number(c.currentCreditSpend || 0) <= 0}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${hasPermission('edit_customers') && Number(c.currentCreditSpend || 0) > 0
                                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <CurrencyDollarIcon className="w-4 h-4" />
                                        {Number(c.currentCreditSpend || 0) > 0 ? 'Settle Credit' : 'All Settled'}
                                    </button>
                                </TableTd>
                                <TableTd>
                                    <button
                                        onClick={() => {
                                            if (!hasPermission('delete_customers')) return;
                                            if (window.confirm('Are you sure you want to delete this customer?')) {
                                                fetch(`/customer/${c.id}`, {
                                                    method: 'DELETE',
                                                    headers: {
                                                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                    },
                                                }).then(() => window.location.reload());
                                            }
                                        }}
                                        disabled={!hasPermission('delete_customers')}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${hasPermission('delete_customers')
                                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
