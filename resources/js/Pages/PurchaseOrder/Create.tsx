import Authenticated from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";
import { Head, useForm, Link, router } from "@inertiajs/react";
import { Trash2, Plus, ArrowLeft, Send, Receipt, Truck, Pencil, CheckCircle, Clock, AlertCircle, FileText, Eye, Printer, ChevronRight, Hash, Calendar, Layers, Search, MapPin, Phone, Mail, Building2, User, Save, ShoppingCart, Package } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { toast } from "react-toastify";

interface PurchaseOrderForm {
    supplier_id: string | number;
    order_date: string;
    expected_delivery_date: string;
    notes: string;
    items: Array<{
        product_id: string | number;
        quantity: number;
        unit_cost: number;
    }>;
}

export default function CreatePurchaseOrder({ suppliers, products }: { suppliers: any[], products: any[] }) {
    const { data, setData, post, processing, errors } = useForm<PurchaseOrderForm>({
        supplier_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        notes: '',
        items: []
    });

    const addItem = () => {
        setData('items', [
            ...data.items,
            { product_id: '', quantity: 1, unit_cost: 0 }
        ]);
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: keyof PurchaseOrderForm['items'][0], value: any) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        
        // Auto-fill cost if product selected
        if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                newItems[index].unit_cost = product.sellingPrice; // Default to selling price as fallback or cost if available
            }
        }
        
        setData('items', newItems);
    };

    const calculateTotal = () => {
        return data.items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.items.length === 0) {
            toast.error("Please add at least one product to the order.");
            return;
        }
        post(route('purchase-orders.store'), {
            onSuccess: () => toast.success("Purchase Order created successfully!")
        });
    };

    return (
        <Authenticated>
            <Head title="Create Purchase Order" />

            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href={route('purchase-orders.index')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">New Purchase Order</h1>
                        <p className="text-gray-500">Draft a new order for your suppliers.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Header Info */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Supplier</label>
                            <select
                                value={data.supplier_id}
                                onChange={e => setData('supplier_id', e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 shadow-inner"
                            >
                                <option value="">Select a supplier</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.supplierName} ({s.companyName})</option>
                                ))}
                            </select>
                            {errors.supplier_id && <p className="text-red-500 text-xs font-bold">{errors.supplier_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Order Date</label>
                                <input
                                    type="date"
                                    value={data.order_date}
                                    onChange={e => setData('order_date', e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 shadow-inner"
                                />
                                {errors.order_date && <p className="text-red-500 text-xs font-bold">{errors.order_date}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Exp. Delivery</label>
                                <input
                                    type="date"
                                    value={data.expected_delivery_date}
                                    onChange={e => setData('expected_delivery_date', e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Notes / Instructions</label>
                            <textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                placeholder="Any special instructions for the supplier..."
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 shadow-inner h-24"
                            />
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-indigo-500" />
                                Order Items
                            </h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Product
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100 animate-premium-in">
                                    <div className="md:col-span-5 space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">Product</label>
                                        <select
                                            value={item.product_id}
                                            onChange={e => updateItem(index, 'product_id', e.target.value)}
                                            className="w-full border-gray-200 rounded-xl text-sm"
                                        >
                                            <option value="">Choose product...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.productName} ({p.productCode})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">Quantity</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => updateItem(index, 'quantity', e.target.value)}
                                            className="w-full border-gray-200 rounded-xl text-sm text-center"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">Unit Cost</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.unit_cost}
                                            onChange={e => updateItem(index, 'unit_cost', e.target.value)}
                                            className="w-full border-gray-200 rounded-xl text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2 text-right py-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Subtotal</p>
                                        <p className="font-bold text-gray-900">Rs. {(item.quantity * item.unit_cost).toLocaleString()}</p>
                                    </div>
                                    <div className="md:col-span-1 text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {data.items.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                                    <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-medium">No items added yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center px-4">
                            <div className="text-gray-500 italic text-sm">
                                {data.items.length} items in the cart
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Estimated Total</p>
                                <p className="text-3xl font-black text-indigo-600">Rs. {calculateTotal().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link
                            href={route('purchase-orders.index')}
                            className="px-8 py-4 text-gray-500 font-bold hover:text-gray-800 transition-all"
                        >
                            Discard
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {processing ? 'Creating...' : 'Finalize Purchase Order'}
                        </button>
                    </div>
                </form>
            </div>
        </Authenticated>
    );
}
