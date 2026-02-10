import Authenticated from "@/Layouts/AuthenticatedLayout";
import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { 
    ArrowLeft, 
    Printer, 
    CheckCircle, 
    Clock, 
    Trash2, 
    Package,
    Truck,
    User,
    Calendar,
    AlertCircle,
    XCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";

export default function ShowPurchaseOrder({ order }: { order: any }) {
    const { post, processing } = useForm();

    const handleReceive = () => {
        if (window.confirm("Are you sure you want to mark this order as received? This will automatically increment product stock levels.")) {
            post(route('purchase-orders.receive', order.id), {
                onSuccess: () => toast.success("Inventory updated successfully!")
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'received': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'sent': return <Truck className="w-5 h-5 text-blue-600" />;
            case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Clock className="w-5 h-5 text-yellow-600" />;
        }
    };

    return (
        <Authenticated>
            <Head title={`PO #${order.po_number}`} />

            <div className="p-6 max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href={route('purchase-orders.index')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500 hover:text-indigo-600 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-gray-900">Purchase Order #{order.po_number}</h1>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-gray-500">Managing order from {order.supplier.supplierName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={route('purchase-orders.print', order.id)}
                            target="_blank"
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <Printer className="w-5 h-5" />
                            Print Order
                        </a>
                        {order.status !== 'received' && (
                            <button
                                onClick={handleReceive}
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                            >
                                <CheckCircle className="w-5 h-5" />
                                {processing ? 'Processing...' : 'Mark as Received'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Order Items</h3>
                                <span className="text-xs font-bold text-gray-500">{order.items.length} Products</span>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4 text-center">Qty</th>
                                        <th className="px-6 py-4 text-right">Unit Cost</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.items.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{item.product.productName}</div>
                                                <div className="text-[10px] font-black text-indigo-400">{item.product.productCode}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-black text-gray-700">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right text-gray-500 text-sm">Rs. {Number(item.unit_cost).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-black text-indigo-600">Rs. {Number(item.total_cost).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-indigo-50/50">
                                        <td colSpan={3} className="px-6 py-6 text-right font-black text-gray-900 uppercase tracking-widest text-xs">Grand Total</td>
                                        <td className="px-6 py-6 text-right font-black text-indigo-600 text-xl tracking-tighter">
                                            Rs. {Number(order.total_amount).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {order.notes && (
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm mb-4">Notes & Instructions</h3>
                                <p className="text-gray-600 leading-relaxed text-sm italic">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Supplier Info */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm border-b border-gray-100 pb-3">Supplier Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</p>
                                    <p className="font-bold text-gray-900">{order.supplier.supplierName}</p>
                                    <p className="text-xs text-gray-500">{order.supplier.companyName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</p>
                                    <p className="text-sm text-gray-700">{order.supplier.supplierPhone}</p>
                                    <p className="text-sm text-gray-700">{order.supplier.supplierEmail}</p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</p>
                                    <p className="text-xs text-gray-600 leading-relaxed">{order.supplier.supplierAddress}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Meta */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm border-b border-gray-100 pb-3">Order Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Ordered On</p>
                                        <p className="text-sm font-bold text-gray-900">{format(new Date(order.order_date), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Truck className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Expected By</p>
                                        <p className="text-sm font-bold text-gray-900">{order.expected_delivery_date ? format(new Date(order.expected_delivery_date), 'MMM dd, yyyy') : 'No Date Set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Created By</p>
                                        <p className="text-sm font-bold text-gray-900">{order.creator.name}</p>
                                    </div>
                                </div>
                                {order.status === 'received' && (
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-2xl border border-green-100 animate-pulse">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Received By</p>
                                            <p className="text-xs font-bold text-green-900">{order.receiver?.name || 'System'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {order.status === 'draft' && (
                            <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100 flex gap-4">
                                <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0" />
                                <div className="text-xs text-yellow-800 leading-relaxed font-medium">
                                    This order is in <strong>Draft</strong> mode. You can still edit items or cancel before sending to supplier.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
