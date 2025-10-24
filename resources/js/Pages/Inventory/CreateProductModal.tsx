import { usePage } from '@inertiajs/react';
import { useState } from 'react';
export default function CreateProductModal({
    isOpen,
    onClose,
    onCreated,
    seriasList
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
        discount: "",
        productDescription: "",
        buyingPrice: "",
        tax: "",
        sellingPrice: "",
        quantity: "",
        unit: "",
        lowStock: "",
        brand: "",
        purchaseDate: "",
        expiryDate: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: [] });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setForm({ ...form, productImage: e.target.files[0] });
            setErrors({ ...errors, productImage: [] });
        }
    };
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== "" && value !== null) {
                formData.append(key, value as any);
            }
        });

        try {
            // safely read CSRF token
            const tokenElement = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
            const csrfToken = tokenElement?.content ?? "";

            const res = await fetch("/inventory", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                onCreated(data.product);
                setSuccessMsg(data.message);
                setShowSuccess(true);

                setTimeout(() => {
                    onClose();
                    setShowSuccess(false);
                }, 2000);
            } else if (res.status === 422) {
                const data = await res.json();
                setErrors(data.errors || {});
            }
        } catch (err) {
            console.error("Submit error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-lg">
                <h2 className="text-lg font-bold mb-4">Add Product</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium">Product Name</label>
                            <input
                                type="text"
                                name="productName"
                                placeholder="Product Name"
                                value={form.productName}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.productName && (
                                <p className="text-red-500 text-sm">{errors.productName[0]}</p>
                            )}
                        </div>

                        {/* Product Code */}
                        <div>
                            <label className="block text-sm font-medium">Product Code</label>
                            <input
                                type="text"
                                name="productCode"
                                placeholder="Product Code"
                                value={form.productCode}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.productCode && (
                                <p className="text-red-500 text-sm">{errors.productCode[0]}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Series Number</label>
                            <select
                                name="seriasId"
                                value={form.seriasId}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            >
                                <option value="">-- Select Serias --</option>
                                {seriasList?.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        {s.seriasNo}
                                    </option>
                                ))}
                            </select>
                            {errors.seriasId && (
                                <p className="text-red-500 text-sm">{errors.seriasId[0]}</p>
                            )}
                        </div>



                        {/* Description */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">Description</label>
                            <textarea
                                name="productDescription"
                                placeholder="Description"
                                value={form.productDescription}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.productDescription && (
                                <p className="text-red-500 text-sm">{errors.productDescription[0]}</p>
                            )}
                        </div>

                        {/* Buying Price */}
                        <div>
                            <label className="block text-sm font-medium">Buying Price</label>
                            <input
                                type="number"
                                name="buyingPrice"
                                placeholder="Buying Price"
                                value={form.buyingPrice}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.buyingPrice && (
                                <p className="text-red-500 text-sm">{errors.buyingPrice[0]}</p>
                            )}
                        </div>

                        {/* Tax */}
                        <div>
                            <label className="block text-sm font-medium">Tax</label>
                            <input
                                type="number"
                                name="tax"
                                placeholder="Tax Price"
                                value={form.tax}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.tax && (
                                <p className="text-red-500 text-sm">{errors.tax[0]}</p>
                            )}
                        </div>

                        {/* Discount */}
                        <div>
                            <label className="block text-sm font-medium">Discount</label>
                            <input
                                type="number"
                                name="discount"
                                placeholder="Discount"
                                value={form.discount}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.discount && (
                                <p className="text-red-500 text-sm">{errors.discount[0]}</p>
                            )}
                        </div>

                        {/* Selling Price */}
                        <div>
                            <label className="block text-sm font-medium">Selling Price</label>
                            <input
                                type="number"
                                name="sellingPrice"
                                placeholder="Selling Price"
                                value={form.sellingPrice}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.sellingPrice && (
                                <p className="text-red-500 text-sm">{errors.sellingPrice[0]}</p>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                placeholder="Quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.quantity && (
                                <p className="text-red-500 text-sm">{errors.quantity[0]}</p>
                            )}
                        </div>

                        {/* Low Stock */}
                        <div>
                            <label className="block text-sm font-medium">Low Stock</label>
                            <input
                                type="number"
                                name="lowStock"
                                placeholder="Low Stock"
                                value={form.lowStock}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.lowStock && (
                                <p className="text-red-500 text-sm">{errors.lowStock[0]}</p>
                            )}
                        </div>

                        {/* Unit */}
                        <div>
                            <label className="block text-sm font-medium">Unit</label>
                            <input
                                type="text"
                                name="unit"
                                placeholder="Unit (pcs, kg)"
                                value={form.unit}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.unit && (
                                <p className="text-red-500 text-sm">{errors.unit[0]}</p>
                            )}
                        </div>

                        {/* Brand */}
                        <div className="col-span-2">
                            <label className="block text-gray-800 font-semibold mb-2">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                placeholder="Brand"
                                value={form.brand}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.brand && (
                                <p className="text-red-500 text-sm">{errors.brand[0]}</p>
                            )}
                        </div>

                        {/* Purchase Date */}
                        <div className="col-span-2">
                            <label className="block text-gray-800 font-semibold mb-2">Purchase Date</label>
                            <input
                                type="date"
                                name="purchaseDate"
                                value={form.purchaseDate}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.purchaseDate && (
                                <p className="text-red-500 text-sm">{errors.purchaseDate[0]}</p>
                            )}
                        </div>

                        {/* Expiry Date */}
                        {/* <div className="col-span-2">
                            <label className="block text-gray-800 font-semibold mb-2">Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={form.expiryDate}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.expiryDate && (
                                <p className="text-red-500 text-sm">{errors.expiryDate[0]}</p>
                            )}
                        </div> */}

                        {/* Product Image */}
                        <div className="col-span-2">
                            <input
                                type="file"
                                name="productImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full border p-2 rounded"
                            />
                            {errors.productImage && (
                                <p className="text-red-500 text-sm">{errors.productImage[0]}</p>
                            )}
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
