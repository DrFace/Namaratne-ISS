import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { toast } from "react-toastify";
import Breadcrumbs from "@/Components/UI/Breadcrumbs";
import Card from "@/Components/UI/Card";
import Button from "@/Components/UI/Button";
import { Building2, DollarSign, Save } from "lucide-react";

interface CurrencyRate {
  id: number;
  from_currency: string;
  to_currency: string;
  rate: string;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  updated_by_user?: {
    name: string;
  };
}

interface Props {
  vatNumber: string;
  currencyRate: CurrencyRate;
}

export default function SettingsIndex() {
  const { vatNumber: initialVatNumber, currencyRate } = usePage().props as unknown as Props;
  const [vatNumber, setVatNumber] = useState(initialVatNumber || "");
  const [exchangeRate, setExchangeRate] = useState(currencyRate?.rate || "320.00");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    router.post(
      route("settings.update"),
      {
        vat_number: vatNumber,
        exchange_rate: exchangeRate,
      },
      {
        onSuccess: () => {
          toast.success("Settings updated successfully!");
          setIsSaving(false);
        },
        onError: (errors: any) => {
          toast.error("Error updating settings");
          setIsSaving(false);
        },
      }
    );
  };

  return (
    <Authenticated>
      <div className="flex-1 p-6 space-y-6 animate-premium-in min-h-screen bg-gray-50/50">
        <Breadcrumbs items={[{ label: 'Settings', href: route('settings.index') }]} />
        
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <Building2 className="w-6 h-6" />
             </div>
             <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight text-left">Company Settings</h2>
          </div>

          <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
            <div className="p-0">
               <form onSubmit={handleSubmit}>
                 {/* VAT Number Section */}
                 <div className="p-8 space-y-6">
                   <div className="space-y-4">
                     <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Building2 className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Identity & Tax</h3>
                     </div>
                     
                     <div className="grid gap-2">
                       <label
                         htmlFor="vatNumber"
                         className="text-sm font-bold text-gray-700 dark:text-gray-300"
                       >
                         Company VAT Number
                       </label>
                       <input
                         type="text"
                         id="vatNumber"
                         value={vatNumber}
                         onChange={(e) => setVatNumber(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                         placeholder="e.g. VAT/123/4567"
                       />
                       <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                         This VAT number will be displayed on all invoices in the "Invoice From" section.
                       </p>
                     </div>
                   </div>

                   {/* Currency Exchange Rate Section */}
                   <div className="pt-8 border-t border-gray-100 dark:border-gray-700 space-y-6">
                     <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Currency & Exchange</h3>
                     </div>

                     <div className="grid gap-2">
                       <label
                         htmlFor="exchangeRate"
                         className="text-sm font-bold text-gray-700 dark:text-gray-300"
                       >
                         Global Exchange Rate (USD to LKR)
                       </label>
                       <div className="flex items-center gap-4">
                         <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                            <span className="text-gray-400 font-bold mr-3">1 USD =</span>
                            <input
                              type="number"
                              id="exchangeRate"
                              step="0.01"
                              min="0.01"
                              value={exchangeRate}
                              onChange={(e) => setExchangeRate(e.target.value)}
                              className="bg-transparent border-none outline-none flex-1 font-bold text-gray-900 dark:text-white"
                              placeholder="320.00"
                            />
                            <span className="text-gray-400 font-bold ml-3">LKR</span>
                         </div>
                       </div>
                       <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                         This rate will be used when entering product prices in USD and displaying invoices in different currencies.
                       </p>
                       {currencyRate?.updated_at && (
                         <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded-full w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                              Last Sync: {new Date(currencyRate.updated_at).toLocaleString()}
                            </span>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>

                 <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-end items-center gap-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400 hidden sm:block">Changes will be applied immediately for all users.</p>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="min-w-[140px] shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                      {isSaving ? "Saving..." : (
                        <span className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Save Changes
                        </span>
                      )}
                    </Button>
                 </div>
               </form>
            </div>
          </Card>
        </div>
      </div>
    </Authenticated>
  );
}
