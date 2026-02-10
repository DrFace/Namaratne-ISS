import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import Breadcrumbs from "@/Components/UI/Breadcrumbs";
import Card from "@/Components/UI/Card";
import Button from "@/Components/UI/Button";
import DataTable from "@/Components/UI/DataTable";
import Badge from "@/Components/UI/Badge";
import Modal from "@/Components/UI/Modal";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import ConfirmButton from "@/Components/elements/buttons/ConfirmButton";

export default function VehicleTypesPage() {
    const { vehicleTypes } = usePage().props as any;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
    const [form, setForm] = useState({ seriasNo: "" });
    const [errors, setErrors] = useState<any>({});

    const columns = [
        { header: "ID", accessor: "id", sortable: true },
        { header: "Vehicle Type", accessor: "seriasNo", sortable: true },
        { header: "Created At", accessor: (item: any) => new Date(item.created_at).toLocaleDateString() },
        {
            header: "Status",
            accessor: () => <Badge variant="success">Active</Badge>
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingType ? route('vehicle-types.update', editingType.id) : route('vehicle-types.store');
        const method = editingType ? 'put' : 'post';

        router[method](url, form, {
            onSuccess: () => {
                setIsModalOpen(false);
                setEditingType(null);
                setForm({ seriasNo: "" });
                window.location.reload();
            },
            onError: (err) => setErrors(err)
        });
    };

    const handleEdit = (item: any) => {
        setEditingType(item);
        setForm({ seriasNo: item.seriasNo });
        setIsModalOpen(true);
    };

    return (
        <Authenticated>
            <div className="flex-1 p-6 space-y-4 animate-premium-in">
                <Breadcrumbs items={[
                    { label: 'Inventory', href: route('products.index') },
                    { label: 'Vehicle Types', href: '#' }
                ]} />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Vehicle Types</h2>
                        <p className="text-sm text-gray-500">Manage vehicle categories for your inventory.</p>
                    </div>
                    <Button onClick={() => { setEditingType(null); setForm({ seriasNo: "" }); setIsModalOpen(true); }} className="rounded-2xl gap-2 shadow-lg shadow-indigo-500/20">
                        <Plus className="w-4 h-4" /> Add New Type
                    </Button>
                </div>

                <Card className="border-none shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5">
                    <div className="p-4">
                        <DataTable 
                            data={vehicleTypes}
                            columns={columns}
                            actions={(item) => (
                                <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleEdit(item)}
                                        className="hover:bg-indigo-50 text-indigo-600 rounded-xl"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <ConfirmButton
                                        url={route('vehicle-types.destroy', item.id)}
                                        label="Delete"
                                        className="!p-0 bg-transparent"
                                    >
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="hover:bg-rose-50 text-rose-600 rounded-xl"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </ConfirmButton>
                                </div>
                            )}
                        />
                    </div>
                </Card>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingType ? "Edit Vehicle Type" : "Add Vehicle Type"}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Vehicle Type Name
                            </label>
                            <input
                                type="text"
                                value={form.seriasNo}
                                onChange={(e) => setForm({ seriasNo: e.target.value })}
                                className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500 transition-all"
                                placeholder="e.g. Toyota Corolla, Honda Civic"
                                required
                            />
                            {errors.seriasNo && <p className="text-red-500 text-xs mt-1">{errors.seriasNo}</p>}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit">
                                {editingType ? "Update Type" : "Create Type"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </Authenticated>
    );
}
