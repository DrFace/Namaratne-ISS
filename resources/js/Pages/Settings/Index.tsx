import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { toast } from "react-toastify";

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
        onError: (errors) => {
          toast.error("Error updating settings");
          setIsSaving(false);
        },
      }
    );
  };

  return (
    <Authenticated>
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Company Settings</h2>

          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              {/* VAT Number Section */}
              <div className="mb-6">
                <label
                  htmlFor="vatNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company VAT Number
                </label>
                <input
                  type="text"
                  id="vatNumber"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter VAT registration number"
                />
                <p className="mt-2 text-sm text-gray-500">
                  This VAT number will be displayed on all invoices in the "Invoice From" section.
                </p>
              </div>

              {/* Currency Exchange Rate Section */}
              <div className="mb-6 pt-6 border-t border-gray-200">
                <label
                  htmlFor="exchangeRate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Currency Exchange Rate
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">1 USD =</span>
                  <input
                    type="number"
                    id="exchangeRate"
                    step="0.01"
                    min="0.01"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="320.00"
                  />
                  <span className="text-gray-700">LKR</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This rate will be used when entering product prices in USD and displaying invoices in different currencies.
                </p>
                {currencyRate?.updated_at && (
                  <p className="mt-2 text-xs text-gray-400">
                    Last updated: {new Date(currencyRate.updated_at).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${isSaving
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
                    }`}
                >
                  {isSaving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Authenticated>
  );
}
