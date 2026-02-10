import Authenticated from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { 
  RotateCcw, 
  Search, 
  Eye, 
  Calendar, 
  User, 
  FileText,
  BadgeAlert,
  BadgeCheck,
  BadgeHelp,
  XCircle
} from "lucide-react";
import Breadcrumbs from "@/Components/UI/Breadcrumbs";
import Card from "@/Components/UI/Card";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import EmptyState from "@/Components/UI/EmptyState";

interface Return {
  id: number;
  return_number: string;
  sale: {
    billNumber: string;
    customer: {
      name: string;
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
}

interface Props {
  returns: {
    data: Return[];
    links: any[];
  };
  filters: {
    search: string;
  };
}

const ReturnIndex = ({ returns, filters }: Props) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('returns.index'), { search: searchTerm }, { preserveState: true });
  };

  const getStatusBadge = (status: Return['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Completed</Badge>;
      case 'received':
        return <Badge variant="info" className="flex items-center gap-1"><BadgeAlert className="w-3 h-3" /> Received</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1"><BadgeHelp className="w-3 h-3" /> Pending</Badge>;
      case 'rejected':
        return <Badge variant="error" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Authenticated>
      <div className="flex-1 p-6 space-y-6 animate-premium-in min-h-screen bg-gray-50/50">
        <Breadcrumbs items={[{ label: 'Returns', href: route('returns.index') }]} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Returns Management</h2>
            <p className="text-gray-500 dark:text-gray-400">Track and manage product returns and refunds.</p>
          </div>

          <form onSubmit={handleSearch} className="relative group max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by return # or invoice #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </form>
        </div>

        <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-bottom border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Return #</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice / Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {returns.data.length > 0 ? (
                  returns.data.map((ret) => (
                    <tr key={ret.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                            <RotateCcw className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white capitalize">{ret.return_number}</p>
                            <p className="text-xs text-gray-400 italic">By {ret.createdBy.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <FileText className="w-3 h-3 text-gray-400" />
                             <span className="text-sm font-medium text-gray-900 dark:text-white">{ret.sale.billNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <User className="w-3 h-3 text-gray-400" />
                             <span className="text-xs text-gray-500">{ret.sale.customer?.name || 'Walk-in Customer'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900 dark:text-white">Rs. {ret.refund_amount.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Total: {ret.total_amount.toLocaleString()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(ret.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(ret.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={route('returns.show', ret.id)}>
                          <Button variant="outline" size="sm" className="rounded-xl">
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12">
                      <EmptyState
                         title="No returns found"
                         description="Try adjusting your search or process a new return from a sale."
                         icon={RotateCcw}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Authenticated>
  );
};

export default ReturnIndex;
