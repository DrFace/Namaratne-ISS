// @ts-nocheck
import Authenticated from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import { 
  RotateCcw, 
  ArrowLeft,
  Save,
  Trash2,
  Package,
  AlertCircle
} from "lucide-react";
import Breadcrumbs from "@/Components/UI/Breadcrumbs";
import Card from "@/Components/UI/Card";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import { toast } from "react-toastify";

interface SaleItem {
  id: number;
  productId: number;
  product: {
    productName: string;
    productCode: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  returned_quantity: number;
}

interface Props {
  sale: {
    id: number;
    billNumber: string;
    customer: {
      name: string;
    } | null;
    salesDetails: SaleItem[];
  };
}

interface ReturnFormData {
  sale_id: number;
  total_amount: number;
  refund_amount: number;
  reason: string;
  status: string;
  items: any[];
}

const ReturnCreate = ({ sale }: Props) => {
  const { data, setData, post, processing, errors } = useForm<any>({
    sale_id: sale.id,
    total_amount: 0,
    refund_amount: 0,
    reason: "",
    status: "completed",
    items: []
  });

  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const toggleItem = (item: SaleItem) => {
    const exists = selectedItems.find(i => i.product_id === item.productId);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.product_id !== item.productId));
    } else {
      const available = item.quantity - item.returned_quantity;
      if (available <= 0) {
        toast.warning("All items of this product have already been returned.");
        return;
      }
      setSelectedItems([...selectedItems, {
        product_id: item.productId,
        name: item.product.productName,
        code: item.product.productCode,
        max_quantity: available,
        quantity: 1,
        unit_price: item.unitPrice,
        refund_amount: item.unitPrice,
        restock: true
      }]);
    }
  };

  const updateItem = (productId: number, field: string, value: any) => {
    const updated = selectedItems.map(item => {
      if (item.product_id === productId) {
        let newItem = { ...item, [field]: value };
        if (field === 'quantity') {
          newItem.refund_amount = newItem.unit_price * value;
        }
        return newItem;
      }
      return item;
    });
    setSelectedItems(updated);
  };

  const calculateTotals = () => {
    const total = selectedItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    const refund = selectedItems.reduce((acc, item) => acc + item.refund_amount, 0);
    return { total, refund };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to return.");
      return;
    }

    const { total, refund } = calculateTotals();
    
    post(route('returns.store'), {
      onBefore: () => {
        setData((prev: any) => ({
            ...prev,
            items: selectedItems,
            total_amount: total,
            refund_amount: refund
        }));
      },
      onSuccess: () => toast.success("Return processed successfully"),
      onError: () => toast.error("Error processing return")
    });
  };

  const { total, refund } = calculateTotals();

  return (
    <Authenticated>
      <div className="flex-1 p-6 space-y-6 animate-premium-in min-h-screen bg-gray-50/50">
        <Breadcrumbs items={[
          { label: 'Returns', href: route('returns.index') },
          { label: 'Process Return', href: '#' }
        ]} />

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => window.history.back()} className="p-0 h-auto">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Process Return</h2>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="neutral" className="px-4 py-2 text-sm font-bold">
                    Invoice: {sale.billNumber}
                </Badge>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                Select Items to Return
              </h3>

              <div className="space-y-4">
                {sale.salesDetails.map((item) => {
                  const available = item.quantity - item.returned_quantity;
                  const isSelected = selectedItems.some(i => i.product_id === item.productId);

                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleItem(item)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                        ? 'border-indigo-500 bg-indigo-50/30' 
                        : available > 0 
                          ? 'border-gray-100 dark:border-gray-700 hover:border-gray-200' 
                          : 'opacity-50 grayscale cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 dark:text-white">{item.product.productName}</p>
                        <p className="text-xs text-gray-500">{item.product.productCode}</p>
                      </div>
                      <div className="flex items-center gap-8 text-right">
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Qty Sold</p>
                          <p className="font-bold">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Available</p>
                          <Badge variant={available > 0 ? "success" : "neutral"} className="mt-1">
                             {available} {available === 0 && "(Returned)"}
                          </Badge>
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 font-medium">Unit Price</p>
                           <p className="font-bold text-indigo-600">Rs. {item.unitPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {selectedItems.length > 0 && (
              <Card className="border-none shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5 p-6 space-y-6 animate-premium-in">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-indigo-500" />
                  Return Details
                </h3>

                <div className="space-y-6">
                  {selectedItems.map((item) => (
                    <div key={item.product_id} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{item.name}</h4>
                        <button 
                          onClick={() => setSelectedItems(selectedItems.filter(i => i.product_id !== item.product_id))}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Return Quantity</label>
                          <input 
                            type="number"
                            min="1"
                            max={item.max_quantity}
                            value={item.quantity}
                            onChange={(e) => updateItem(item.product_id, 'quantity', parseInt(e.target.value))}
                            className="w-full bg-white dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Per Item Refund</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={item.refund_amount / item.quantity}
                            onChange={(e) => updateItem(item.product_id, 'refund_amount', parseFloat(e.target.value) * item.quantity)}
                            className="w-full bg-white dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                          <input 
                            type="checkbox"
                            checked={item.restock}
                            onChange={(e) => updateItem(item.product_id, 'restock', e.target.checked)}
                            id={`restock-${item.product_id}`}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                          />
                          <label htmlFor={`restock-${item.product_id}`} className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                             Add back to stock
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Return Reason</label>
                    <textarea 
                      value={data.reason}
                      onChange={(e) => setData("reason", e.target.value)}
                      placeholder="Explain why these items are being returned..."
                      rows={3}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5 p-6 sticky top-6">
              <h3 className="text-lg font-bold mb-6 pb-4 border-b border-gray-100 dark:border-gray-700 uppercase tracking-widest text-gray-400">Return Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Items Selected</span>
                  <span className="font-bold">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Total Return Value</span>
                  <span className="font-bold">Rs. {total.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-lg font-extrabold">
                    <span className="text-gray-900 dark:text-white">Total Refund</span>
                    <span className="text-emerald-600 font-black">Rs. {refund.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex gap-3 text-amber-600">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-xs leading-relaxed">
                      Ensure all returned inventory is physically inspected before restocking. Partial refunds are supported.
                    </p>
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    disabled={processing || selectedItems.length === 0}
                    className="w-full py-4 text-lg shadow-xl shadow-indigo-200 dark:shadow-none"
                  >
                    {processing ? (
                        <RotateCcw className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                           <Save className="w-5 h-5" />
                           Confirm & Process
                        </span>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Authenticated>
  );
};

export default ReturnCreate;
