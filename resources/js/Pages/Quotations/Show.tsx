import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import { 
  ArrowLeftIcon, 
  PrinterIcon, 
  ArrowRightCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  productName: string;
  productCode: string;
}

interface QuotationItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  unit_price: string;
  total: string;
}

interface Quotation {
  id: number;
  quotation_number: string;
  customer_id: number;
  customer: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  total_amount: string;
  discount_value: string;
  tax_amount: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted' | 'expired';
  valid_until: string;
  notes: string | null;
  created_at: string;
  items: QuotationItem[];
  converted_to_sale_id: number | null;
  created_by: {
    name: string;
  };
}

interface Props {
  quotation: Quotation;
}

export default function Show({ quotation }: Props) {
  const [processing, setProcessing] = useState(false);

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

  const handleStatusUpdate = (status: string) => {
    if (!confirm(`Are you sure you want to mark this quotation as ${status}?`)) return;
    
    router.patch(route('quotations.status', quotation.id), { status }, {
      onSuccess: () => toast.success(`Quotation marked as ${status}`),
    });
  };

  const handleConvertToInvoice = () => {
    if (!confirm('This will create a new invoice based on this quotation. Continue?')) return;
    
    setProcessing(true);
    router.post(route('quotations.convert', quotation.id), {}, {
      onSuccess: () => {
        toast.success('Converted to invoice successfully');
        setProcessing(false);
      },
      onError: (err: any) => {
        toast.error(err.message || 'Error converting to invoice');
        setProcessing(false);
      }
    });
  };

  const subtotal = quotation.items.reduce((acc, item) => acc + parseFloat(item.total), 0);

  return (
    <AuthenticatedLayout>
      <Head title={`Quotation - ${quotation.quotation_number}`} />

      <div className="max-w-5xl mx-auto space-y-8 animate-premium-in pb-20">
        {/* Header / Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.get(route('quotations.index'))}>
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {quotation.quotation_number}
                </h1>
                <Badge variant={getStatusVariant(quotation.status)}>
                  {quotation.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Created on {format(new Date(quotation.created_at), 'MMMM dd, yyyy')} by {quotation.created_by.name}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <PrinterIcon className="w-5 h-5 mr-2" />
              Print
            </Button>
            
            {['draft', 'sent'].includes(quotation.status) && (
              <Button variant="outline" onClick={() => router.get(route('quotations.edit', quotation.id))}>
                <PencilIcon className="w-5 h-5 mr-2" />
                Edit
              </Button>
            )}

            {quotation.status === 'draft' && (
              <Button variant="outline" className="text-indigo-600 border-indigo-200" onClick={() => handleStatusUpdate('sent')}>
                Mark as Sent
              </Button>
            )}

            {['sent', 'draft'].includes(quotation.status) && (
              <>
                <Button variant="outline" className="text-emerald-600 border-emerald-200" onClick={() => handleStatusUpdate('approved')}>
                  Approve
                </Button>
                <Button variant="outline" className="text-rose-600 border-rose-200" onClick={() => handleStatusUpdate('rejected')}>
                  Reject
                </Button>
              </>
            )}

            {quotation.status !== 'converted' ? (
               ['approved', 'sent'].includes(quotation.status) && (
                <Button onClick={handleConvertToInvoice} isLoading={processing}>
                  <ArrowRightCircleIcon className="w-5 h-5 mr-2" />
                  Convert to Invoice
                </Button>
               )
            ) : null}

            {quotation.status === 'converted' && quotation.converted_to_sale_id && (
              <Link href={route('billing.index')}>
                <Button variant="secondary">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  View Related Invoice
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Customer Information
                </h3>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{quotation.customer.name}</div>
                  <div className="text-sm text-gray-500">{quotation.customer.email || 'No email provided'}</div>
                  <div className="text-sm text-gray-500">{quotation.customer.phone || 'No phone provided'}</div>
                  <div className="text-sm text-gray-500 mt-2 italic">{quotation.customer.address || 'No address provided'}</div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Validity Info
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Valid Until:</span>
                    <span className="font-bold text-indigo-600">{format(new Date(quotation.valid_until), 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Days Remaining:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {Math.max(0, Math.ceil((new Date(quotation.valid_until).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} Days
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Line Items */}
            <Card className="p-0 overflow-hidden border-0 shadow-xl shadow-slate-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-gray-500 font-bold uppercase tracking-widest text-[10px] border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Item Description</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-900 font-medium">
                  {quotation.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{item.product.productName}</div>
                        <div className="text-[10px] text-gray-400 font-mono italic">{item.product.productCode}</div>
                      </td>
                      <td className="px-6 py-4 text-center tabular-nums">{item.quantity}</td>
                      <td className="px-6 py-4 text-right tabular-nums">LKR {parseFloat(item.unit_price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white tabular-nums">LKR {parseFloat(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Notes */}
            {quotation.notes && (
              <Card className="p-6 bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
                <h3 className="text-xs font-black uppercase text-amber-600 tracking-widest mb-3">Terms & Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {quotation.notes}
                </p>
              </Card>
            )}
          </div>

          {/* Totals Summary */}
          <div className="space-y-6">
            <Card className="p-6 border-0 bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
              <h3 className="text-xs font-black uppercase text-indigo-200 tracking-widest mb-6 flex items-center gap-2">
                <CurrencyDollarIcon className="w-4 h-4" />
                Financial Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm opacity-90">
                  <span>Subtotal</span>
                  <span className="font-bold">LKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm opacity-90">
                  <span>Discount</span>
                  <span className="font-bold text-rose-200">- LKR {parseFloat(quotation.discount_value).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm opacity-90 pb-4">
                  <span>Tax Amount</span>
                  <span className="font-bold text-indigo-200">+ LKR {parseFloat(quotation.tax_amount).toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-indigo-500/50 flex justify-between items-end">
                  <span className="text-sm font-black uppercase tracking-tighter opacity-80">Final Estimate</span>
                  <span className="text-3xl font-black tabular-nums">LKR {parseFloat(quotation.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </Card>
            
            {/* Status Timeline Placeholder */}
            <Card className="p-6 space-y-4">
               <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Activity Log</h3>
               <div className="space-y-4">
                 <div className="flex gap-3">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                   <div>
                     <div className="text-xs font-bold text-gray-900 dark:text-white">Created & Saved</div>
                     <div className="text-[10px] text-gray-400">{format(new Date(quotation.created_at), 'MMM dd, yyyy HH:mm')}</div>
                   </div>
                 </div>
                 {quotation.status === 'converted' && (
                   <div className="flex gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                     <div>
                       <div className="text-xs font-bold text-emerald-600 uppercase italic">Successfully Converted</div>
                       <div className="text-[10px] text-gray-400">Transaction completed</div>
                     </div>
                   </div>
                 )}
               </div>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
