import { usePage } from "@inertiajs/react";
import { useState } from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import MasterTable, { TableBody, TableTd } from "@/Components/elements/tables/masterTable";
import CreateCustomerModal from "./CreateCustomerModal";
import { PencilIcon } from "@heroicons/react/20/solid";
import ConfirmButton from "@/Components/elements/buttons/ConfirmButton";
import { PrimaryLink } from "@/Components/elements/buttons/PrimaryButton";
import EditCustomerModal from "./EditCustomerModal";

export default function CustomersIndexPage() {
    const { customers: initialCustomers } = usePage().props as any;
    const [customers, setCustomers] = useState(initialCustomers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const filters = {}; // currently empty
    const createLink = undefined; // or route("products.create")
    const search = { placeholder: "Search Customer" };
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

    const tableColumns = [
        { label: "", sortField: "", sortable: true },
        { label: "ID", sortField: "id", sortable: true },
        { label: "Customer ID", sortField: "customerId", sortable: true },
        { label: "Name", sortField: "name", sortable: true },
        { label: "Contact", sortField: "contactNumber", sortable: true },
        { label: "Credit Limit", sortField: "creditLimit", sortable: true },
        { label: "Net Balance", sortField: "netBalance", sortable: true },
        { label: "Status", sortField: "status", sortable: true },
        { label: "Availability", sortField: "availability", sortable: true },
    ];

    return (
        <Authenticated>
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Customers</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Add Customer
                    </button>
                </div>

                <MasterTable
                    tableColumns={tableColumns}
                    filters={filters}
                    url={route("customer.index")}
                    createLink={createLink}
                    links={customers?.meta?.links}
                >
                    {customers.data.map((c: any) => (
                        <TableBody
                            key={c.id}
                            buttons={
                                <>
                                     <button
                                        onClick={() => openEditModal(c)}
                                        className="flex items-center text-blue-600 hover:underline"
                                    >
                                        <PencilIcon className="w-4 h-4 mr-1" />
                                        Edit
                                    </button>
                                    <ConfirmButton url={`/customer/${c.id}`} label="Delete" />
                                </>
                            }
                        >
                            <TableTd>{c.id}</TableTd>
                            <TableTd>{c.customerId}</TableTd>
                            <TableTd>{c.name}</TableTd>
                            <TableTd>{c.contactNumber}</TableTd>
                            <TableTd>{c.creditLimit}</TableTd>
                            <TableTd>{c.netBalance}</TableTd>
                            <TableTd>{c.status}</TableTd>
                            <TableTd>
                                <span className={c.availability ? "text-green-600" : "text-red-600"}>
                                    {c.availability ? "Available" : "Unavailable"}
                                </span>
                            </TableTd>
                        </TableBody>
                    ))}
                </MasterTable>

                <CreateCustomerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCreated={handleCustomerCreated}
                />
                <EditCustomerModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    customer={selectedCustomer}
                    onUpdated={handleCustomerUpdated}
                />
            </div>
        </Authenticated>
    );
}
