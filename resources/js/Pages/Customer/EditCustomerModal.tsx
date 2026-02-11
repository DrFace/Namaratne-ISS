import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function EditCustomerModal({
    isOpen,
    onClose,
    customer,
    onUpdated,
    permissions,
    isAdmin,
    discountCategories = [], // ✅ pass this from parent
}: any) {
    const [form, setForm] = useState({
        customerId: "",
        name: "",
        contactNumber: "",
        email: "",
        address: "",
        vatNumber: "",
        creditLimit: "",
        creditPeriod: "30 days",
        status: "active",
        availability: true,

        // ✅ NEW
        discountCategoryId: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [loading, setLoading] = useState(false);

    // Helper function to check permissions
    const hasPermission = (permission: string) => {
        if (isAdmin) return true;
        return permissions && permissions.includes(permission);
    };

    // ✅ helper to read discount category id from any backend shape
    const getCustomerDiscountCategoryId = (c: any) => {
        if (!c) return "";
        return (
            c.discountCategoryId ??
            c.discount_category_id ??
            c.discountCategory?.id ??
            c.discount_category?.id ??
            ""
        ).toString();
    };

    // Load customer data into form when modal opens
    useEffect(() => {
        if (isOpen && customer) {
            setForm({
                customerId: customer.customerId || "",
                name: customer.name || "",
                contactNumber: customer.contactNumber || "",
                email: customer.email || "",
                address: customer.address || "",
                vatNumber: customer.vatNumber || "",
                creditLimit: customer.creditLimit || "",
                creditPeriod: customer.creditPeriod || "30 days",
                status: customer.status || "active",
                availability: customer.availability ?? true,

                // ✅ NEW
                discountCategoryId: getCustomerDiscountCategoryId(customer),
            });

            setErrors({});
        }
    }, [isOpen, customer]);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
        setErrors({ ...errors, [name]: [] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer?.id) return;

        setLoading(true);
        setErrors({});

        try {
            const token =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const res = await fetch(`/customer/${customer.id}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success("Customer updated successfully!");
                onUpdated(data.customer);
                onClose();
            } else if (res.status === 422) {
                const data = await res.json();
                setErrors(data.errors || {});
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // ✅ ensure currently selected id exists in options (otherwise select shows placeholder)
    const selectedId = form.discountCategoryId?.toString() || "";
    const hasSelectedInList =
        selectedId &&
        discountCategories?.some((c: any) => c.id?.toString() === selectedId);

    // optional display name for fallback option
    const selectedName =
        customer?.discountCategory?.name ||
        customer?.discount_category?.name ||
        `Selected (ID: ${selectedId})`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto shadow-lg">
                <h2 className="text-lg font-bold mb-4">Edit Customer</h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium">
                            Customer Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Customer Name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.name[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Contact Number
                        </label>
                        <input
                            type="text"
                            name="contactNumber"
                            placeholder="Contact Number"
                            value={form.contactNumber}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Address
                        </label>
                        <textarea
                            name="address"
                            placeholder="Address"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            VAT Number (Optional)
                        </label>
                        <input
                            type="text"
                            name="vatNumber"
                            placeholder="VAT Registration Number"
                            value={form.vatNumber}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Credit Limit
                        </label>
                        <input
                            type="number"
                            name="creditLimit"
                            placeholder="Credit Limit"
                            value={form.creditLimit}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* ✅ Discount Category */}
                    <div>
                        <label className="block text-sm font-medium">
                            Discount Category
                        </label>
                        <select
                            name="discountCategoryId"
                            value={selectedId}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">
                                -- Select Discount Category --
                            </option>

                            {/* ✅ fallback option so current value shows even if not in list */}
                            {selectedId && !hasSelectedInList && (
                                <option value={selectedId}>
                                    {selectedName}
                                </option>
                            )}

                            {discountCategories?.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {errors.discountCategoryId && (
                            <p className="text-red-500 text-sm">
                                {errors.discountCategoryId[0]}
                            </p>
                        )}
                    </div>

                    {hasPermission("change_customer_credit_period") && (
                        <div>
                            <label className="block text-sm font-medium">
                                Credit Period
                            </label>
                            <select
                                name="creditPeriod"
                                value={form.creditPeriod}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            >
                                <option value="15 days">15 days</option>
                                <option value="30 days">30 days</option>
                                <option value="50 days">50 days</option>
                                <option value="60 days">60 days</option>
                            </select>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="availability"
                                checked={form.availability}
                                onChange={handleChange}
                            />
                            Available
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-1/3 border p-2 rounded"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            {loading ? "Updating..." : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
