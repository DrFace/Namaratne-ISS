import Authenticated from "@/Layouts/AuthenticatedLayout";
import React from "react";
import { Link } from "@inertiajs/react";
import { 
  RotateCcw, 
  ArrowLeft,
  Calendar,
  User,
  FileText,
  BadgeCheck,
  BadgeAlert,
  BadgeHelp,
  XCircle,
  Package,
  Receipt,
  Eye
} from "lucide-react";
import Breadcrumbs from "@/Components/UI/Breadcrumbs";
import Card from "@/Components/UI/Card";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";

interface ReturnItem {
  id: number;
  product: {
    productName: string;
    productCode: string;
  };
  quantity: number;
  unit_price: number;
  refund_amount: number;
  restock: boolean;
}

interface Return {
  id: number;
  return_number: string;
  sale: {
    id: number;
    billNumber: string;
    customer: {
      name: string;
      contactNumber: string;
    } | null;
  };
  total_amount: number;
  refund_amount: number;
  status: 'pending' | 'received' | 'completed' | 'rejected';
  reason: string;
  created_at: string;
  createdBy: {
    name: string;
  };
  items: ReturnItem[];
}

interface Props {
  return: Return;
}

const ReturnShow = ({ return: ret }: Props) => {
  const getStatusBadge = (status: Return['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-1 px-3 py-1.5"><BadgeCheck className="w-4 h-4" /> Completed</Badge>;
      case 'received':
        return <Badge variant="info" className="flex items-center gap-1 px-3 py-1.5"><BadgeAlert className="w-4 h-4" /> Received</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1 px-3 py-1.5"><BadgeHelp className="w-4 h-4" /> Pending</Badge>;
      case 'rejected':
        return <Badge variant="error" className="flex items-center gap-1 px-3 py-1.5"><XCircle className="w-4 h-4" /> Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Authenticated>
      <div className="flex-1 p-6 space-y-6 animate-premium-in min-h-screen bg-gray-50/50">
        <Breadcrumbs items={[
          { label: 'Returns', href: route('returns.index') },
          { label: ret.return_number, href: '#' }
        ]} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={route('returns.index')}>
              <Button variant="ghost" className="p-0 h-auto">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                Return Details
                <span className="text-indigo-600 font-black">#{ret.return_number}</span>
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(ret.created_at).toLocaleString()}</span>
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> Processed by {ret.createdBy.name}</span>
              </div>
            </div>
          </div>
          {getStatusBadge(ret.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5 p-0 overflow-hidden">
               <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-500" />
                    Returned Items
                  </h3>
                  <Badge variant="neutral" className="font-bold">{ret.items.length} Items</Badge>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4 text-center">Qty</th>
                        <th className="px-6 py-4">Unit Price</th>
                        <th className="px-6 py-4">Refund</th>
                        <th className="px-6 py-4 text-right">Restocked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
                      {ret.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-4">
                             <p className="text-gray-900 dark:text-white">{item.product.productName}</p>
                             <p className="text-xs text-gray-400">{item.product.productCode}</p>
                          </td>
                          <td className="px-6 py-4 text-center">{item.quantity}</td>
                          <td className="px-6 py-4 text-gray-500">Rs. {item.unit_price.toLocaleString()}</td>
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Rs. {item.refund_amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                             {item.restock ? (
                               <Badge variant="success" className="text-[10px]">Yes</Badge>
                             ) : (
                               <Badge variant="neutral" className="text-[10px]">No</Badge>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </Card>

            {ret.reason && (
               <Card className="border-none shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    Return Reason
                  </h3>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 italic text-gray-600 dark:text-gray-400">
                    "{ret.reason}"
                  </div>
               </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-indigo-600 text-white p-6 overflow-hidden relative">
               <Receipt className="absolute -bottom-8 -right-8 w-40 h-40 opacity-10 rotate-12" />
               <div className="relative z-10 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Refund Summary</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="text-sm font-medium opacity-80">Total Value</span>
                        <span className="text-xl font-bold">Rs. {ret.total_amount.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-end pt-2">
                        <span className="text-sm font-medium opacity-80">Total Refund</span>
                        <div className="text-right">
                           <p className="text-3xl font-black">Rs. {ret.refund_amount.toLocaleString()}</p>
                           <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Status: Paid</p>
                        </div>
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="border-none shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5 p-6 space-y-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-4">Linked Sale</h3>
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <p className="text-sm font-bold text-gray-900 dark:text-white">Invoice {ret.sale.billNumber}</p>
                     <p className="text-xs text-gray-500">{ret.sale.customer?.name || 'Walk-in Customer'}</p>
                  </div>
                  <Link href={route('billing.view', ret.sale.id)}>
                    <Button variant="outline" size="sm" className="rounded-xl">
                       <Eye className="w-4 h-4 mr-2" />
                       View
                    </Button>
                  </Link>
               </div>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 rounded-2xl py-4 font-bold border-2" onClick={() => window.print()}>
                  Print Receipt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Authenticated>
  );
};

export default ReturnShow;
