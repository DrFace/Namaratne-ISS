import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import DataTable from '@/Components/UI/DataTable';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface Customer {
  id: number;
  name: string;
}

interface Quotation {
  id: number;
  quotation_number: string;
  customer_id: number;
  customer: Customer;
  total_amount: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted' | 'expired';
  valid_until: string;
  created_at: string;
}

interface Props {
  quotations: {
    data: Quotation[];
    meta?: any;
    links?: any;
    total: number;
  };
  filters: any;
}

export default function Index({ quotations, filters }: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'converted': return 'success';
      case 'sent': return 'primary';
      case 'draft': return 'neutral';
      case 'rejected': return 'error';
      case 'expired': return 'warning';
      default: return 'neutral';
    }
  };

  const columns = [
    {
      header: 'Quotation #',
      accessor: (item: Quotation) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/30 text-slate-600">
            <DocumentTextIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white tracking-tight">
              {item.quotation_number}
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
              {format(new Date(item.created_at), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Customer',
      accessor: (item: Quotation) => (
        <div className="font-medium text-gray-700 dark:text-gray-300">
          {item.customer?.name || 'Unknown'}
        </div>
      ),
    },
    {
      header: 'Total Amount',
      accessor: (item: Quotation) => (
        <div className="font-black text-gray-900 dark:text-gray-100 font-mono">
          LKR {parseFloat(item.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Valid Until',
      accessor: (item: Quotation) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(item.valid_until), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (item: Quotation) => (
        <Badge variant={getStatusVariant(item.status)}>
          {item.status.toUpperCase()}
        </Badge>
      ),
      sortable: true,
    },
  ];

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      router.delete(route('quotations.destroy', id), {
        onSuccess: () => toast.success('Quotation deleted successfully'),
      });
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Quotations" />

      <div className="space-y-8 animate-premium-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Quotations & Estimates
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your business proposals and convert them to invoices.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filter
            </Button>
            <Button onClick={() => router.get(route('quotations.create'))}>
              <PlusIcon className="w-5 h-5 mr-2" />
              New Quotation
            </Button>
          </div>
        </div>

        {/* Filters (Simplified for now) */}
        {isFilterOpen && (
          <Card className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-dashed">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-500">Status Quick Link:</span>
              {['draft', 'sent', 'approved', 'converted'].map(status => (
                 <Badge 
                   key={status} 
                   variant={getStatusVariant(status)} 
                   className="cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => router.get(route('quotations.index', { status }))}
                 >
                   {status.toUpperCase()}
                 </Badge>
              ))}
              <Badge variant="neutral" className="ml-auto cursor-pointer" onClick={() => router.get(route('quotations.index'))}>
                <ArrowPathIcon className="w-3 h-3 mr-1" />
                CLEAR ALL
              </Badge>
            </div>
          </Card>
        )}

        {/* Index Table */}
        <Card className="p-0 overflow-hidden border-0 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <DataTable
            data={quotations.data}
            columns={columns}
            searchPlaceholder="Search quotations or customers..."
            actions={(item) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => router.get(route('quotations.show', item.id))}>
                  <EyeIcon className="w-4 h-4" />
                </Button>
                {['draft', 'sent'].includes(item.status) && (
                  <Button variant="ghost" size="sm" onClick={() => router.get(route('quotations.edit', item.id))}>
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                )}
                {item.status !== 'converted' && (
                  <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(item.id)}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
            onRowClick={(item) => router.get(route('quotations.show', item.id))}
          />
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
