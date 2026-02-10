import { useState, useEffect } from "react";
import axios from "axios";

export default function AddStockModal({
    isOpen,
    onClose,
    onStockAdded,
    productsList,
}: {
    isOpen: boolean;
    onClose: () => void;
    onStockAdded: (s: any) => void;
    productsList: { id: number; productName: string; productCode: string }[];
}) {
    const [stockMode, setStockMode] = useState<"new" | "existing">("new");
    const [availableBatches, setAvailableBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);

    const [form, setForm] = useState({
        productId: "",
        buyingPrice: "",
        tax: "",
        profitMargin: "",
        sellingPrice: "",
        quantity: "",
        batchNumber: "",
        purchaseDate: "",
    });
    const [currency, setCurrency] = useState<"LKR" | "USD">("LKR");
    const [exchangeRate, setExchangeRate] = useState(320);

    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // Fetch exchange rate on mount
    useEffect(() => {
        fetchExchangeRate();
    }, []);

    const fetchExchangeRate = async () => {
        try {
            const response = await axios.get("/api/currency/rate");
            setExchangeRate(response.data.rate || 320);
        } catch (error) {
            console.error("Error fetching exchange rate:", error);
        }
    };

    // Auto-calculate selling price
    useEffect(() => {
        if (stockMode === "new") {
            // Convert buying price to LKR if USD is selected
            const buyingInLKR = currency === "USD"
                ? parseFloat(form.buyingPrice) * exchangeRate
                : parseFloat(form.buyingPrice);

            const taxPercent = parseFloat(form.tax) || 0;
            const profitPercent = parseFloat(form.profitMargin) || 0;

            const taxAmount = (buyingInLKR * taxPercent) / 100;
            const profitAmount = (buyingInLKR * profitPercent) / 100;
            const calculated = buyingInLKR + taxAmount + profitAmount;

            setForm((prev) => ({
                ...prev,
                sellingPrice: calculated > 0 ? calculated.toFixed(2) : "",
            }));
        }
    }, [form.buyingPrice, form.tax, form.profitMargin, stockMode, currency, exchangeRate]);

    // Fetch batches when product is selected in existing mode
    useEffect(() => {
        if (stockMode === "existing" && form.productId) {
            fetchBatchesForProduct(form.productId);
        }
    }, [stockMode, form.productId]);

    const fetchBatchesForProduct = async (productId: string) => {
        try {
            const response = await axios.get(`/inventory/batches/${productId}`);
            setAvailableBatches(response.data.batches || []);
        } catch (error) {
            console.error("Error fetching batches:", error);
            setAvailableBatches([]);
        }
    };

    const handleBatchSelection = (batchId: string) => {
        const batch = availableBatches.find((b) => b.id === parseInt(batchId));
        setSelectedBatch(batch);

        if (batch) {
            setForm((prev) => ({
                ...prev,
                buyingPrice: batch.buyingPrice,
                tax: batch.tax,
                profitMargin: batch.profitMargin,
                sellingPrice: batch.sellingPrice,
                batchNumber: batch.batchNumber,
                purchaseDate: batch.purchaseDate,
            }));
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: [] }));
    };

    const handleClose = () => {
        // Check if there are any errors
        if (Object.keys(errors).length > 0) {
            // Show alert or just return without closing
            alert("Please fix the errors before closing");
            return;
        }
        // Reset form and errors
        setErrors({});
        setForm({
            productId: "",
            buyingPrice: "",
            tax: "",
            profitMargin: "",
            sellingPrice: "",
            quantity: "",
            batchNumber: "",
            purchaseDate: "",
        });
        setCurrency("LKR");
        setSelectedBatch(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validate form fields
        const validationErrors: { [key: string]: string[] } = {};

        if (!form.productId) {
            validationErrors.productId = ["Please select a product"];
        }

        if (stockMode === "existing" && !selectedBatch) {
            validationErrors.batchNumber = ["Please select a batch"];
        }

        if (!form.quantity || parseInt(form.quantity) <= 0) {
            validationErrors.quantity = ["Quantity is required and must be at least 1"];
        }

        // Only validate these fields for new batch mode
        if (stockMode === "new") {
            if (!form.buyingPrice || parseFloat(form.buyingPrice) <= 0) {
                validationErrors.buyingPrice = ["Buying price is required and must be greater than 0"];
            }
            if (form.tax === "" || parseFloat(form.tax) < 0) {
                validationErrors.tax = ["Tax is required and cannot be negative"];
            }
            if (form.profitMargin === "" || parseFloat(form.profitMargin) < 0) {
                validationErrors.profitMargin = ["Profit margin is required and cannot be negative"];
            }
            if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) {
                validationErrors.sellingPrice = ["Selling price must be greater than 0"];
            }
            if (!form.batchNumber || form.batchNumber.trim() === "") {
                validationErrors.batchNumber = ["Batch number is required"];
            }
            if (!form.purchaseDate) {
                validationErrors.purchaseDate = ["Purchase date is required"];
            }
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            axios.defaults.withCredentials = true;
            await axios.get("/sanctum/csrf-cookie");

            const formData = new FormData();

            if (stockMode === "existing") {
                // For existing batch, only send productId (batch ID) and quantity
                formData.append("batchId", selectedBatch.id);
                formData.append("quantity", form.quantity);
                formData.append("mode", "existing");
            } else {
                // For new batch, convert buying price to LKR if USD selected
                console.log("Currency:", currency);
                console.log("Exchange Rate:", exchangeRate);
                console.log("Buying Price (input):", form.buyingPrice);

                const buyingPriceInLKR = currency === "USD"
                    ? (parseFloat(form.buyingPrice) * exchangeRate).toFixed(2)
                    : form.buyingPrice;

                console.log("Buying Price in LKR:", buyingPriceInLKR);

                // Send all fields with converted price
                Object.entries(form).forEach(([key, value]) => {
                    if (value !== "" && value !== null) {
                        const finalValue = key === "buyingPrice" ? buyingPriceInLKR : value;
                        formData.append(key, finalValue as any);
                    }
                });
                formData.append("mode", "new");
            }

            const { data } = await axios.post("/stock", formData, {
                headers: { Accept: "application/json" },
            });

            onStockAdded(data.stock);
            setSuccessMsg(data.message || "Stock added successfully!");
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                setErrors({});
                setForm({
                    productId: "",
                    buyingPrice: "",
                    tax: "",
                    profitMargin: "",
                    sellingPrice: "",
                    quantity: "",
                    batchNumber: "",
                    purchaseDate: "",
                });
                setCurrency("LKR");
                setSelectedBatch(null);
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
                <h2 className="text-lg font-bold mb-4">Add Stock</h2>

                {showSuccess && (
                    <div className="bg-green-100 text-green-700 p-2 rounded mb-2 text-sm">
                        ✅ {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Stock Mode Selection */}
                    <div className="col-span-2 bg-gray-50 p-3 rounded">
                        <label className="block text-sm font-medium mb-2">
                            Stock Mode <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="new"
                                    checked={stockMode === "new"}
                                    onChange={(e) => {
                                        setStockMode(e.target.value as "new" | "existing");
                                        setSelectedBatch(null);
                                        setForm({
                                            productId: form.productId,
                                            buyingPrice: "",
                                            tax: "",
                                            profitMargin: "",
                                            sellingPrice: "",
                                            quantity: "",
                                            batchNumber: "",
                                            purchaseDate: "",
                                        });
                                    }}
                                    className="mr-2"
                                />
                                <span className="text-sm">Create New Batch</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="existing"
                                    checked={stockMode === "existing"}
                                    onChange={(e) => {
                                        setStockMode(e.target.value as "new" | "existing");
                                        setSelectedBatch(null);
                                        setForm({
                                            productId: form.productId,
                                            buyingPrice: "",
                                            tax: "",
                                            profitMargin: "",
                                            sellingPrice: "",
                                            quantity: "",
                                            batchNumber: "",
                                            purchaseDate: "",
                                        });
                                    }}
                                    className="mr-2"
                                />
                                <span className="text-sm">Add to Existing Batch</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium">
                                Product <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="productId"
                                value={form.productId}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                                required
                            >
                                <option value="">Select Product</option>
                                {productsList.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.productCode} - {product.productName}
                                    </option>
                                ))}
                            </select>
                            {errors.productId && (
                                <p className="text-red-500 text-sm">
                                    {errors.productId[0]}
                                </p>
                            )}
                        </div>

                        {/* Batch Selection for Existing Mode */}
                        {stockMode === "existing" && form.productId && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">
                                    Select Batch <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedBatch?.id || ""}
                                    onChange={(e) => handleBatchSelection(e.target.value)}
                                    className="w-full border p-2 rounded"
                                    required
                                >
                                    <option value="">Select Batch</option>
                                    {availableBatches.map((batch) => (
                                        <option key={batch.id} value={batch.id}>
                                            Batch: {batch.batchNumber} - Stock: {batch.quantity} - Rs. {batch.sellingPrice}
                                        </option>
                                    ))}
                                </select>
                                {errors.batchNumber && (
                                    <p className="text-red-500 text-sm">
                                        {errors.batchNumber[0]}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Show all fields for new batch mode */}
                        {stockMode === "new" && (
                            <>
                                {/* Currency Selection */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-2">
                                        Price Currency
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                value="LKR"
                                                checked={currency === "LKR"}
                                                onChange={(e) => setCurrency(e.target.value as "LKR")}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">LKR (Sri Lankan Rupee)</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                value="USD"
                                                checked={currency === "USD"}
                                                onChange={(e) => setCurrency(e.target.value as "USD")}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">USD (US Dollar)</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Buying Price ({currency}) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="buyingPrice"
                                        value={form.buyingPrice}
                                        onChange={handleChange}
                                        placeholder={`Buying Price in ${currency}`}
                                        className="w-full border p-2 rounded"
                                        required
                                    />
                                    {currency === "USD" && form.buyingPrice && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            ≈ LKR {(parseFloat(form.buyingPrice) * exchangeRate).toFixed(2)}
                                        </p>
                                    )}
                                    {errors.buyingPrice && (
                                        <p className="text-red-500 text-sm">
                                            {errors.buyingPrice[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Tax (%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="tax"
                                        value={form.tax}
                                        onChange={handleChange}
                                        placeholder="Tax %"
                                        className="w-full border p-2 rounded"
                                        required
                                        min="0"
                                    />
                                    {errors.tax && (
                                        <p className="text-red-500 text-sm">
                                            {errors.tax[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Profit Margin (%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="profitMargin"
                                        value={form.profitMargin}
                                        onChange={handleChange}
                                        placeholder="Profit Margin %"
                                        className="w-full border p-2 rounded"
                                        required
                                        min="0"
                                    />
                                    {errors.profitMargin && (
                                        <p className="text-red-500 text-sm">
                                            {errors.profitMargin[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Selling Price (Auto) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="sellingPrice"
                                        value={form.sellingPrice}
                                        readOnly
                                        className="w-full border p-2 rounded bg-gray-100 text-gray-600"
                                    />
                                    {errors.sellingPrice && (
                                        <p className="text-red-500 text-sm">
                                            {errors.sellingPrice[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={form.quantity}
                                        onChange={handleChange}
                                        placeholder="Quantity"
                                        className="w-full border p-2 rounded"
                                        required
                                        min="1"
                                    />
                                    {errors.quantity && (
                                        <p className="text-red-500 text-sm">
                                            {errors.quantity[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Batch Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="batchNumber"
                                        value={form.batchNumber}
                                        onChange={handleChange}
                                        placeholder="Batch Number"
                                        className="w-full border p-2 rounded"
                                        required
                                    />
                                    {errors.batchNumber && (
                                        <p className="text-red-500 text-sm">
                                            {errors.batchNumber[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Purchase Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="purchaseDate"
                                        value={form.purchaseDate}
                                        onChange={handleChange}
                                        className="w-full border p-2 rounded"
                                        required
                                    />
                                    {errors.purchaseDate && (
                                        <p className="text-red-500 text-sm">
                                            {errors.purchaseDate[0]}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Quantity field - shown for both modes */}
                        {stockMode === "existing" && selectedBatch && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">
                                    Quantity to Add <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    placeholder="Quantity to add"
                                    className="w-full border p-2 rounded"
                                    required
                                    min="1"
                                />
                                {errors.quantity && (
                                    <p className="text-red-500 text-sm">
                                        {errors.quantity[0]}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Current stock: {selectedBatch.quantity}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Add Stock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
