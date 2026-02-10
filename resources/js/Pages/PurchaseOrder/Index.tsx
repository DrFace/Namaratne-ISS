import Authenticated from "@/Layouts/AuthenticatedLayout";
import React from "react";
import { Head, Link } from "@inertiajs/react";
import { 
    Plus, 
    FileText, 
    Eye, 
    Truck, 
    CheckCircle, 
    Clock, 
    XCircle,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";

export default function PurchaseOrderIndex({ orders }: { orders: any }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'received': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <Authenticated>
            <Head title="Purchase Orders" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
                        <p className="text-gray-500">Order products from suppliers and track stock arrival.</p>
                    </div>
                    <Link
                        href={route('purchase-orders.create')}
                        className="btn-premium flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        Create New PO
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Orders</p>
                                <p className="text-2xl font-black text-gray-900">{orders.total}</p>
                            </div>
                        </div>
                    </div>
                    {/* Add more stats as needed */}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">PO Number</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Supplier</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Total Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.data.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">{order.po_number}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {order.supplier.supplierName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {format(new Date(order.order_date), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black text-indigo-600">Rs. {Number(order.total_amount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={route('purchase-orders.show', order.id)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                            <a
                                                href={route('purchase-orders.print', order.id)}
                                                target="_blank"
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                                title="Print PO"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                                        No purchase orders found. Start by creating one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Authenticated>
    );
}
