import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";

export default function SettingsIndex() {
  const props = usePage().props as any;
  const [vatNumber, setVatNumber] = useState(props.vatNumber || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    router.post(
      route("settings.update"),
      { vat_number: vatNumber },
      {
        onSuccess: () => {
          alert("Settings updated successfully!");
          setIsSaving(false);
        },
        onError: () => {
          alert("Error updating settings");
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
