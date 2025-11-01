import { useState, useEffect } from "react";
import axios from "axios";

export default function CreateProductModal({
    isOpen,
    onClose,
    onCreated,
    seriasList,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (p: any) => void;
    seriasList: { id: number; seriasNo: string }[];
}) {
    const [form, setForm] = useState({
        productName: "",
        productCode: "",
        productImage: null as File | null,
        seriasId: "",
        profitMargin: "",
        productDescription: "",
        buyingPrice: "",
        tax: "",
        sellingPrice: "",
        quantity: "",
        unit: "",
        lowStock: "",
        brand: "",
        batchNumber: "",
        purchaseDate: "",
        expiryDate: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // 🔹 Auto calculate selling price (no %)
    useEffect(() => {
        const buying = parseFloat(form.buyingPrice) || 0;
        const tax = parseFloat(form.tax) || 0;
        const margin = parseFloat(form.profitMargin) || 0;
        const calculated = buying + tax + margin;

        if (!isNaN(calculated)) {
            setForm((prev) => ({
                ...prev,
                sellingPrice: calculated.toFixed(2),
            }));
        }
    }, [form.buyingPrice, form.tax, form.profitMargin]);

    // 🔹 Input change
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: [] }));
    };

    // 🔹 File change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setForm({ ...form, productImage: e.target.files[0] });
            setErrors({ ...errors, productImage: [] });
        }
    };

    // 🔹 Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            // ✅ Initialize axios + CSRF protection
            axios.defaults.withCredentials = true;
            await axios.get("/sanctum/csrf-cookie");

            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== "" && value !== null) {
                    formData.append(key, value as any);
                }
            });

            const { data } = await axios.post("/inventory", formData, {
                headers: { Accept: "application/json" },
            });

            onCreated(data.product);
            setSuccessMsg(data.message || "Product created successfully!");
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 1500);
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                console.error("Submit error:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-lg">
                <h2 className="text-lg font-bold mb-4">Add Product</h2>

                {showSuccess && (
                    <div className="bg-green-100 text-green-700 p-2 rounded mb-2 text-sm">
                        ✅ {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium">Product Name</label>
                            <input
                                type="text"
                                name="productName"
                                value={form.productName}
                                onChange={handleChange}
                                placeholder="Product Name"
                                className="w-full border p-2 rounded"
                            />
                            {errors.productName && (
                                <p className="text-red-500 text-sm">
                                    {errors.productName[0]}
                                </p>
                            )}
                        </div>

                        {/* Product Code */}
                        <div>
                            <label className="block text-sm font-medium">Product Code</label>
                            <input
                                type="text"
                                name="productCode"
                                value={form.productCode}
                                onChange={handleChange}
                                placeholder="Product Code"
                                className="w-full border p-2 rounded"
                            />
                            {errors.productCode && (
                                <p className="text-red-500 text-sm">
                                    {errors.productCode[0]}
                                </p>
                            )}
                        </div>

                        {/* Series */}
                        <div>
                            <label className="block text-sm font-medium">Series Number</label>
                            <select
                                name="seriasId"
                                value={form.seriasId}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            >
                                <option value="">-- Select Series --</option>
                                {seriasList?.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.seriasNo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">Description</label>
                            <textarea
                                name="productDescription"
                                value={form.productDescription}
                                onChange={handleChange}
                                placeholder="Description"
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        {/* Buying Price */}
                        <div>
                            <label className="block text-sm font-medium">Buying Price</label>
                            <input
                                type="number"
                                name="buyingPrice"
                                value={form.buyingPrice}
                                onChange={handleChange}
                                placeholder="Buying Price"
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        {/* Tax */}
                        <div>
                            <label className="block text-sm font-medium">Tax</label>
                            <input
                                type="number"
                                name="tax"
                                value={form.tax}
                                onChange={handleChange}
                                placeholder="Tax"
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        {/* Profit Margin (flat) */}
                        <div>
                            <label className="block text-sm font-medium">Profit Margin</label>
                            <input
                                type="number"
                                name="profitMargin"
                                value={form.profitMargin}
                                onChange={handleChange}
                                placeholder="Profit Margin (flat)"
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        {/* Auto Selling Price */}
                        <div>
                            <label className="block text-sm font-medium">
                                Selling Price (Auto)
                            </label>
                            <input
                                type="number"
                                name="sellingPrice"
                                value={form.sellingPrice}
                                readOnly
                                className="w-full border p-2 rounded bg-gray-100 text-gray-600"
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                placeholder="Quantity"
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        {/* Low Stock */}
                        <div>
                            <label className="block text-sm font-medium">Low Stock</label>
                            <input
                                type="number"
                                name="lowStock"
                                value={form.lowStock}
                                onChange={handleChange}
                                placeholder="Low Stock Level"
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        {/* Unit */}
                        <div>
                            <label className="block text-sm font-medium">Unit</label>
                            <input
                                type="text"
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                                placeholder="Unit (pcs, kg)"
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        {/* Brand */}
                        <div>
                            <label className="block text-sm font-medium">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                                placeholder="Brand"
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        {/* Batch Number */}
                        <div>
                            <label className="block text-sm font-medium">Batch Number</label>
                            <input
                                type="text"
                                name="batchNumber"
                                value={form.batchNumber}
                                onChange={handleChange}
                                placeholder="Batch Number"
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        {/* Purchase Date */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">Purchase Date</label>
                            <input
                                type="date"
                                name="purchaseDate"
                                value={form.purchaseDate}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        {/* Product Image */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">Product Image</label>
                            <input
                                type="file"
                                name="productImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
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
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
