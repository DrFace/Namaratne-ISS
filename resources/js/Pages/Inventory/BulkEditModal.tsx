import React, { useState } from 'react';
import Modal from '@/Components/UI/Modal';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import { usePage, router } from '@inertiajs/react';

interface BulkEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedIds: (string | number)[];
    onSuccess: () => void;
    seriasList: { id: number; seriasNo: string }[];
}

export default function BulkEditModal({ isOpen, onClose, selectedIds, onSuccess, seriasList }: BulkEditModalProps) {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const fields = [
        { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Enter brand name' },
        { name: 'unit', label: 'Unit', type: 'text', placeholder: 'e.g. pcs, kg, box' },
        { name: 'lowStock', label: 'Low Stock Threshold', type: 'number', placeholder: '10' },
        { 
            name: 'seriasId', 
            label: 'Vehicle Type', 
            type: 'select', 
            options: seriasList.map(s => ({ label: s.seriasNo, value: s.id })) 
        },
        { 
            name: 'status', 
            label: 'Status', 
            type: 'select', 
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
            ] 
        }
    ];

    const handleChange = (name: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [name]: value === "" ? undefined : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (Object.keys(formData).length === 0) {
            alert("Please select at least one field to update.");
            return;
        }

        setLoading(true);
        try {
            router.post('/api/v1/products/bulk-update', {
                ids: selectedIds,
                data: formData
            }, {
                onSuccess: () => {
                    setLoading(false);
                    onSuccess();
                    onClose();
                    setFormData({});
                },
                onError: (errors) => {
                    setLoading(false);
                    console.error("Bulk update errors:", errors);
                }
            });
        } catch (error) {
            setLoading(false);
            console.error("Bulk update failed:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Bulk Edit (${selectedIds.length} items)`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                    Only the fields you modify will be updated for all selected items. Leave fields blank to keep their current values.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map((field) => (
                        <div key={field.name} className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {field.label}
                            </label>
                            {field.type === 'select' ? (
                                <select
                                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-indigo-500 transition-all text-sm"
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    value={formData[field.name] || ""}
                                >
                                    <option value="">-- No Change --</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    value={formData[field.name] || ""}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-800">
                    <Button variant="ghost" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading || Object.keys(formData).length === 0}>
                        {loading ? "Updating..." : "Apply Changes"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
