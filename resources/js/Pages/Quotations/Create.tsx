import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Badge from '@/Components/UI/Badge';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon, 
  DocumentCheckIcon,
  UserIcon,
  ArchiveBoxIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { addDays } from 'date-fns';

interface Customer {
  id: number;
  name: string;
}

interface Product {
  id: number;
  productName: string;
  productCode: string;
  unitPrice: string;
}

interface QuotationItem {
  product_id: number;
  quantity: number;
  unit_price: number;
}

interface Quotation {
  id: number;
  customer_id: number;
  valid_until: string;
  notes: string | null;
  discount_value: string;
  tax_amount: string;
  items: {
    product_id: number;
    quantity: number;
    unit_price: string;
  }[];
}

interface Props {
  customers: Customer[];
  products: Product[];
  quotation?: Quotation;
}

export default function Create({ customers, products, quotation }: Props) {
  const isEditing = !!quotation;

  const { data, setData, post, put, processing, errors } = useForm({
    customer_id: quotation?.customer_id || '',
    valid_until: quotation?.valid_until || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    notes: quotation?.notes || '',
    discount_value: parseFloat(quotation?.discount_value || '0'),
    tax_amount: parseFloat(quotation?.tax_amount || '0'),
    status: 'draft',
    items: quotation?.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price)
    })) || [] as QuotationItem[],
  });

  const customerOptions = useMemo(() => 
    customers.map(c => ({ value: c.id, label: c.name })), 
  [customers]);

  const productOptions = useMemo(() => 
    products.map(p => ({ 
      value: p.id, 
      label: `${p.productName} (${p.productCode}) - LKR ${parseFloat(p.unitPrice).toFixed(2)}`,
      price: parseFloat(p.unitPrice)
    })), 
  [products]);

  const addItem = () => {
    setData('items', [...data.items, { product_id: 0, quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...data.items];
    newItems.splice(index, 1);
    setData('items', newItems);
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If product changed, update price
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unit_price = parseFloat(product.unitPrice);
      }
    }
    
    setData('items', newItems);
  };

  const totals = useMemo(() => {
    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const finalTotal = subtotal - data.discount_value + data.tax_amount;
    return { subtotal, finalTotal };
  }, [data.items, data.discount_value, data.tax_amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (isEditing) {
      put(route('quotations.update', quotation.id), {
        onSuccess: () => toast.success('Quotation updated successfully'),
      });
    } else {
      post(route('quotations.store'), {
        onSuccess: () => toast.success('Quotation created successfully'),
      });
    }
  };

  function format(date: Date, formatStr: string) {
      // Very simple formatter for internal use
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
  }

  return (
    <AuthenticatedLayout>
      <Head title={isEditing ? 'Edit Quotation' : 'New Quotation'} />

      <div className="max-w-6xl mx-auto space-y-8 animate-premium-in pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.get(route('quotations.index'))}>
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {isEditing ? 'Edit Quotation' : 'Create Quotation'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {isEditing ? 'Refine your estimate' : 'Draft a new business proposal'}
              </p>
            </div>
          </div>
          <Badge variant="primary" className="py-2 px-4 text-xs font-bold tracking-widest uppercase">
            {isEditing ? 'Revision' : 'Drafting Mode'}
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Table */}
            <Card className="p-0 overflow-hidden border-0 shadow-xl shadow-indigo-100/20">
              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <ArchiveBoxIcon className="w-5 h-5 text-indigo-600" />
                  Line Items
                </h2>
                <Button variant="outline" size="sm" type="button" onClick={addItem}>
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Product
                </Button>
              </div>

              <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 font-bold uppercase tracking-tighter text-[10px] border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-3 min-w-[300px]">Product / Item</th>
                      <th className="px-6 py-3 w-24">Qty</th>
                      <th className="px-6 py-3 w-40">Unit Price</th>
                      <th className="px-6 py-3 w-40 text-right">Total</th>
                      <th className="px-6 py-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                    {data.items.map((item, index) => (
                      <tr key={index} className="group hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <Select
                            options={productOptions}
                            value={productOptions.find(opt => opt.value === item.product_id)}
                            onChange={(opt) => updateItem(index, 'product_id', opt?.value)}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select product..."
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-indigo-500 font-bold dark:text-white"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">LKR</span>
                            <input
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-full pl-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-indigo-500 font-bold text-indigo-600 dark:text-indigo-400"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white tabular-nums">
                          {(item.quantity * item.unit_price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            type="button" 
                            onClick={() => removeItem(index)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data.items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                          Click "Add Product" to start building your quotation.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Input
              label="Additional Notes / Terms"
              multiline
              rows={4}
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              placeholder="e.g. Validity period, payment terms, delivery schedule..."
              className="bg-white/50 backdrop-blur-sm"
            />
          </div>

          {/* Sidebar / Totals */}
          <div className="space-y-6">
            <Card className="p-6 border-0 shadow-xl shadow-indigo-100/20 sticky top-24">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <CalculatorIcon className="w-6 h-6 text-indigo-600" />
                Quotation Summary
              </h3>
              
              <div className="space-y-6">
                 {/* Selection Area */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5" />
                      Customer
                    </label>
                    <Select
                      options={customerOptions}
                      value={customerOptions.find(opt => opt.value === data.customer_id)}
                      onChange={(opt) => setData('customer_id', opt?.value || '')}
                      placeholder="Select Customer..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {errors.customer_id && <p className="text-xs text-rose-500 font-bold mt-1">{errors.customer_id}</p>}
                  </div>

                  <Input 
                    label="Valid Until"
                    type="date"
                    value={data.valid_until}
                    onChange={(e) => setData('valid_until', e.target.value)}
                    error={errors.valid_until}
                  />
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex justify-between text-sm font-bold text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900 dark:text-white tabular-nums">LKR {totals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Discount Value</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">-</span>
                      <input
                        type="number"
                        className="w-full pl-8 bg-gray-50 dark:bg-gray-950 border-0 rounded-xl text-sm font-black text-rose-600"
                        value={data.discount_value}
                        onChange={(e) => setData('discount_value', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Tax Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">+</span>
                      <input
                        type="number"
                        className="w-full pl-8 bg-gray-50 dark:bg-gray-950 border-0 rounded-xl text-sm font-black text-indigo-600"
                        value={data.tax_amount}
                        onChange={(e) => setData('tax_amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-dashed border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Estimate</span>
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                      LKR {totals.finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full py-4 text-base" 
                    processing={processing}
                  >
                    <DocumentCheckIcon className="w-5 h-5 mr-2" />
                    {isEditing ? 'Save Changes' : 'Generate Quotation'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
