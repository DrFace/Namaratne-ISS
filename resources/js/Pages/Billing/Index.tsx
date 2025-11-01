import Authenticated from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import axios from "axios";

export default function Billing({ products: initialProducts }: any) {
    const [searchName, setSearchName] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [cartItems, setCartItems] = useState<any[]>([]);

    // Customer fields
    const [customerName, setCustomerName] = useState("");
    const [customerContact, setCustomerContact] = useState("");
    const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // Discount fields
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("fixed");

    // Payment fields
    const [cashAmount, setCashAmount] = useState(0);
    const [cardAmount, setCardAmount] = useState(0);
    const [creditAmount, setCreditAmount] = useState(0);
    const [balance, setBalance] = useState(0);

    // Totals
    const total = cartItems.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);

    // Apply discount
    const discountAmount =
        discountType === "percentage" ? (total * discountValue) / 100 : discountValue;

    const customerCredit = selectedCustomer?.creditBalance || 0;
    const netTotal = Math.max(total - discountAmount - customerCredit, 0);

    const paidAmount = cashAmount + cardAmount + creditAmount;

    useEffect(() => {
        setBalance(netTotal - paidAmount);
    }, [netTotal, paidAmount]);

    // Product filtering
    const filteredProducts = initialProducts.filter((p: any) => {
        return (
            p.productName.toLowerCase().includes(searchName.toLowerCase()) &&
            p.productCode.toLowerCase().includes(searchCode.toLowerCase())
        );
    });

    // Customer search
    useEffect(() => {
        const fetchCustomers = async () => {
            const query = customerContact || customerName;
            if (query.length >= 2) {
                try {
                    const res = await axios.get(`/customers/search?query=${query}`);
                    setCustomerSuggestions(res.data);
                } catch (err) {
                    console.error(err);
                }
            } else {
                setCustomerSuggestions([]);
            }
        };
        fetchCustomers();
    }, [customerContact, customerName]);

    const handleSelectCustomer = (customer: any) => {
        setCustomerName(customer.name);
        setCustomerContact(customer.contactNumber);
        setDiscountValue(customer.discountValue || 0);
        setDiscountType(customer.discountType || "fixed");
        setSelectedCustomer(customer);
        setCustomerSuggestions([]);
    };

    // Cart actions
    const addToCart = (product: any) => {
        const existing = cartItems.find((p) => p.id === product.id);
        if (existing) {
            setCartItems(
                cartItems.map((p) =>
                    p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
                )
            );
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(
            cartItems
                .map((p) => (p.id === id ? { ...p, quantity: p.quantity + delta } : p))
                .filter((p) => p.quantity > 0)
        );
    };

    const removeItem = (id: number) => {
        setCartItems(cartItems.filter((p) => p.id !== id));
    };

    // Save sale
    const saveSale = async (status: "draft" | "approved") => {
        try {
            // Determine payment method
            let paymentMethod: "cash" | "card" | "credit" = "cash";
            if (cashAmount > 0 && cardAmount > 0) paymentMethod = "cash"; // mixed
            else if (cardAmount > 0) paymentMethod = "card";
            else if (creditAmount > 0) paymentMethod = "credit";

            const res = await axios.post("/billing", {
                customerId: selectedCustomer?.id,
                customerName,
                customerContact,
                cartItems,
                totalAmount: total,
                discountValue,
                discountType,
                creditUsed: customerCredit,
                netTotal,
                paidAmount,
                cashAmount,
                cardAmount,
                creditAmount,
                balance,
                paymentMethod,
                status,
            });

            const saleId = res.data.sale?.id;
            alert(res.data.message);

            if (status === "approved" && saleId) {
                window.open(`/billing/print/${saleId}`, "_blank");
                // Reset
                setCartItems([]);
                setCustomerName("");
                setCustomerContact("");
                setSelectedCustomer(null);
                setCashAmount(0);
                setCardAmount(0);
                setCreditAmount(0);
                setDiscountValue(0);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Error saving sale");
        }
    };

    return (
        <Authenticated>
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-8xl mx-auto grid grid-cols-3 gap-6">
                    {/* Products Section */}
                    <div className="col-span-2 bg-white rounded-xl shadow p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                            <input
                                type="text"
                                placeholder="Search by Name"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                            <input
                                type="text"
                                placeholder="Search by Code"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredProducts.map((product: any) => (
                                <div
                                    key={product.id}
                                    className="border rounded p-3 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="font-semibold">{product.productName}</div>
                                        <div className="text-sm text-gray-500">
                                            Rs. {product.sellingPrice}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Stock: {product.quantity}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Code: {product.productCode}
                                        </div>
                                    </div>
                                    <button
                                        className="mt-2 bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                                        onClick={() => addToCart(product)}
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cart & Payment Section */}
                    <div className="bg-white rounded-xl shadow p-4 flex flex-col">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                            Cart Summary
                        </h2>

                        {/* Customer */}
                        <div className="relative mb-3">
                            <label className="font-semibold">Customer Contact</label>
                            <input
                                type="text"
                                placeholder="Enter contact number"
                                value={customerContact}
                                onChange={(e) => setCustomerContact(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                            {customerSuggestions.length > 0 && (
                                <ul className="absolute z-10 bg-white border w-full rounded shadow mt-1 max-h-32 overflow-y-auto">
                                    {customerSuggestions.map((c) => (
                                        <li
                                            key={c.id}
                                            onClick={() => handleSelectCustomer(c)}
                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {c.name} ({c.contactNumber})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="relative mb-3">
                            <label className="font-semibold">Customer Name</label>
                            <input
                                type="text"
                                placeholder="Enter name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>

                        {/* Discounts & Credit */}
                        <div className="text-sm text-gray-700 mb-2">
                            Discount:{" "}
                            <span className="font-semibold">
                                {discountType === "percentage"
                                    ? `${discountValue}%`
                                    : `Rs. ${discountValue}`}
                            </span>
                        </div>

                        {selectedCustomer && selectedCustomer.creditBalance > 0 && (
                            <div className="text-sm text-gray-700 mb-3">
                                Credit Balance Used:{" "}
                                <span className="font-semibold text-blue-600">
                                    Rs. {selectedCustomer.creditBalance}
                                </span>
                            </div>
                        )}

                        {/* Payment */}
                        <div className="space-y-2 mb-3">
                            <label className="font-semibold">Cash Payment</label>
                            <input
                                type="number"
                                placeholder="Cash Amount"
                                value={cashAmount === 0 ? "" : cashAmount}
                                onChange={(e) =>
                                    setCashAmount(e.target.value === "" ? 0 : Number(e.target.value))
                                }
                                className="w-full border rounded p-2"
                            />
                            <label className="font-semibold mt-2">Card Payment</label>
                            <input
                                type="number"
                                placeholder="Card Amount"
                                value={cardAmount === 0 ? "" : cardAmount}
                                onChange={(e) =>
                                    setCardAmount(e.target.value === "" ? 0 : Number(e.target.value))
                                }
                                className="w-full border rounded p-2"
                            />
                            <label className="font-semibold mt-2">Credit Payment</label>
                            <input
                                type="number"
                                placeholder="Credit Amount"
                                value={creditAmount === 0 ? "" : creditAmount}
                                onChange={(e) =>
                                    setCreditAmount(e.target.value === "" ? 0 : Number(e.target.value))
                                }
                                className="w-full border rounded p-2"
                            />
                        </div>

                        {/* Totals */}
                        <div className="flex justify-between mb-1">
                            <span>Total:</span>
                            <span className="font-semibold">Rs. {total}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span>Discount:</span>
                            <span className="font-semibold text-green-600">
                                - Rs. {discountAmount}
                            </span>
                        </div>
                        {selectedCustomer && (
                            <div className="flex justify-between mb-1">
                                <span>Credit Used:</span>
                                <span className="font-semibold text-blue-600">
                                    - Rs. {selectedCustomer.creditBalance}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between mb-1">
                            <span>Net Total:</span>
                            <span className="font-bold text-blue-600">Rs. {netTotal}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span>Balance:</span>
                            <span className="font-bold text-red-500">Rs. {balance}</span>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto mb-4 border-t pt-2">
                            {cartItems.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex justify-between items-center border-b py-2"
                                >
                                    <div>
                                        <div className="font-medium">{p.productName}</div>
                                        <div className="text-sm text-gray-500">
                                            Rs. {p.sellingPrice}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="bg-gray-200 p-1 rounded"
                                            onClick={() => updateQuantity(p.id, -1)}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="font-semibold">{p.quantity}</span>
                                        <button
                                            className="bg-gray-200 p-1 rounded"
                                            onClick={() => updateQuantity(p.id, 1)}
                                        >
                                            <Plus size={14} />
                                        </button>
                                        <button
                                            className="bg-red-500 text-white p-1 rounded"
                                            onClick={() => removeItem(p.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => saveSale("draft")}
                                className="bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-lg font-medium"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={() => saveSale("approved")}
                                className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                            >
                                Print Bill
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
