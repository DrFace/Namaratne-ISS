import Authenticated from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";

export default function Billing({ products: initialProducts }: any) {
    const [searchName, setSearchName] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [cartItems, setCartItems] = useState<any[]>([]);

    // Customer fields
    const [customerName, setCustomerName] = useState("");
    const [customerContact, setCustomerContact] = useState("");
    const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

    // Discount fields
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("fixed");

    // Payment fields
    const [paymentType, setPaymentType] = useState<"cash" | "credit">("cash");
    const [cashAmount, setCashAmount] = useState(0);
    const [balance, setBalance] = useState(0);

    // Totals
    const total = cartItems.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);

    // Apply discount
    const discountAmount =
        discountType === "percentage" ? (total * discountValue) / 100 : discountValue;

    const customerCredit = selectedCustomer?.creditBalance || 0;
    const netTotal = Math.max(total - discountAmount - customerCredit, 0);

    const paidAmount = paymentType === "cash" ? cashAmount : netTotal;

    // Check if customer can purchase (credit period not expired)
    const canCustomerPurchase = selectedCustomer?.canPurchase !== false;
    const creditPeriodExpired = paymentType === "credit" && !canCustomerPurchase;

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
        const query = customerContact || customerName;

        // Set loading state immediately when user types
        if (query.length >= 2) {
            setIsSearchingCustomer(true);
        } else {
            setCustomerSuggestions([]);
            setIsSearchingCustomer(false);
        }

        const fetchCustomers = async () => {
            if (query.length >= 2) {
                try {
                    const res = await axios.get(`/customers/search?query=${query}`);
                    setCustomerSuggestions(res.data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsSearchingCustomer(false);
                }
            }
        };

        const debounceTimer = setTimeout(fetchCustomers, 300);
        return () => clearTimeout(debounceTimer);
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
            // Check if adding one more exceeds stock
            if (existing.quantity + 1 > product.quantity) {
                alert(`Cannot add more. Only ${product.quantity} items available in stock.`);
                return;
            }
            setCartItems(
                cartItems.map((p) =>
                    p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
                )
            );
        } else {
            // Check if product has stock
            if (product.quantity < 1) {
                alert("Product is out of stock.");
                return;
            }
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(
            cartItems
                .map((p) => {
                    if (p.id === id) {
                        const newQuantity = p.quantity + delta;
                        // Find the original product to check stock limit
                        const originalProduct = initialProducts.find((prod: any) => prod.id === id);
                        const maxStock = originalProduct?.quantity || 0;

                        // Prevent exceeding stock
                        if (newQuantity > maxStock) {
                            alert(`Cannot add more. Only ${maxStock} items available in stock.`);
                            return p;
                        }

                        return { ...p, quantity: newQuantity };
                    }
                    return p;
                })
                .filter((p) => p.quantity > 0)
        );
    };

    const setDirectQuantity = (id: number, value: string) => {
        // Allow empty string (user is typing)
        if (value === "") {
            setCartItems(
                cartItems.map((p) =>
                    p.id === id ? { ...p, quantity: "" as any } : p
                )
            );
            return;
        }

        const numValue = parseInt(value);

        // If not a valid number, don't update
        if (isNaN(numValue)) {
            return;
        }

        const originalProduct = initialProducts.find((prod: any) => prod.id === id);
        const maxStock = originalProduct?.quantity || 0;

        if (numValue > maxStock) {
            alert(`Cannot add more. Only ${maxStock} items available in stock.`);
            return;
        }

        setCartItems(
            cartItems.map((p) =>
                p.id === id ? { ...p, quantity: numValue } : p
            )
        );
    };

    const handleQuantityKeyPress = (id: number, e: React.KeyboardEvent<HTMLInputElement>, currentValue: any) => {
        if (e.key === "Enter") {
            const numValue = parseInt(String(currentValue));

            // Remove item if quantity is less than 1 or invalid
            if (isNaN(numValue) || numValue < 1) {
                setCartItems(cartItems.filter((p) => p.id !== id));
            }
        }
    };

    const handleQuantityBlur = (id: number, currentValue: any) => {
        const numValue = parseInt(String(currentValue));

        // Remove item if quantity is less than 1 or invalid
        if (isNaN(numValue) || numValue < 1) {
            setCartItems(cartItems.filter((p) => p.id !== id));
        }
    };

    const removeItem = (id: number) => {
        setCartItems(cartItems.filter((p) => p.id !== id));
    };

    // Save sale
    const saveSale = async (status: "draft" | "approved") => {
        // Validate credit period for approved sales
        if (status === "approved" && creditPeriodExpired) {
            alert("Cannot approve sale: Customer's credit period has expired! Please settle outstanding credit first.");
            return;
        }

        // Validate cash amount for cash payments
        if (status === "approved" && paymentType === "cash" && cashAmount < netTotal) {
            alert("Cash amount must be greater than or equal to the net total!");
            return;
        }

        try {
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
                cashAmount: paymentType === "cash" ? cashAmount : 0,
                cardAmount: 0,
                creditAmount: paymentType === "credit" ? netTotal : 0,
                balance,
                paymentMethod: paymentType,
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
                setPaymentType("cash");
                setCashAmount(0);
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
                        {!selectedCustomer ? (
                            <div className="flex flex-col items-center justify-center h-96">
                                {isSearchingCustomer ? (
                                    <>
                                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                                        <h3 className="text-xl font-semibold text-gray-700">
                                            Searching customers...
                                        </h3>
                                    </>
                                ) : customerSuggestions.length > 0 ? (
                                    <div className="w-full">
                                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                            Select a Customer
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {customerSuggestions.map((customer) => (
                                                <div
                                                    key={customer.id}
                                                    onClick={() => handleSelectCustomer(customer)}
                                                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                                                >
                                                    <div className="font-semibold text-lg text-gray-800">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {customer.contactNumber}
                                                    </div>
                                                    {customer.email && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {customer.email}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (customerName || customerContact) && (customerName.length >= 2 || customerContact.length >= 2) ? (
                                    <div className="text-center">
                                        <div className="text-gray-400 mb-4">
                                            <svg
                                                className="w-24 h-24 mx-auto"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                            No customers found
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            No customers match your search query
                                        </p>
                                        <button
                                            onClick={() => router.visit('/customer')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                                        >
                                            Add New Customer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="text-gray-400 mb-4">
                                            <svg
                                                className="w-24 h-24 mx-auto"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                            Start by searching your customer
                                        </h3>
                                        <p className="text-gray-500">
                                            Enter customer name or contact number in the right panel to begin
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>

                    {/* Cart & Payment Section */}
                    <div className="bg-white rounded-xl shadow p-4 flex flex-col">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                            {selectedCustomer ? "Cart Summary" : "Select Customer"}
                        </h2>

                        {/* Customer */}
                        {!selectedCustomer ? (
                            <>
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-sm text-blue-700 font-medium">
                                        Search for a customer to start billing
                                    </p>
                                </div>
                                <div className="relative mb-3">
                                    <label className="font-semibold">Customer Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full border rounded p-2"
                                        autoFocus
                                    />
                                </div>

                                <div className="relative mb-3">
                                    <label className="font-semibold">Customer Contact</label>
                                    <input
                                        type="text"
                                        placeholder="Enter contact number"
                                        value={customerContact}
                                        onChange={(e) => setCustomerContact(e.target.value)}
                                        className="w-full border rounded p-2"
                                    />
                                </div>

                                <div className="text-xs text-gray-500 mt-2">
                                    Tip: Start typing to search existing customers
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-green-900">{customerName}</p>
                                            <p className="text-sm text-green-700">{customerContact}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedCustomer(null);
                                                setCustomerName("");
                                                setCustomerContact("");
                                                setCartItems([]);
                                                setPaymentType("cash");
                                                setCashAmount(0);
                                            }}
                                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                        >
                                            Change
                                        </button>
                                    </div>
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
                                    <label className="font-semibold">Payment Type</label>
                                    <select
                                        value={paymentType}
                                        onChange={(e) => {
                                            setPaymentType(e.target.value as "cash" | "credit");
                                            setCashAmount(0);
                                        }}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="credit">Credit</option>
                                    </select>

                                    {paymentType === "cash" && (
                                        <>
                                            <label className="font-semibold mt-2">Cash Amount</label>
                                            <input
                                                type="number"
                                                placeholder="Enter cash amount"
                                                value={cashAmount === 0 ? "" : cashAmount}
                                                onChange={(e) =>
                                                    setCashAmount(e.target.value === "" ? 0 : Number(e.target.value))
                                                }
                                                className="w-full border rounded p-2"
                                            />
                                        </>
                                    )}

                                    {paymentType === "credit" && (
                                        <>
                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded space-y-2">
                                                <p className="text-sm text-blue-700">
                                                    Full amount (Rs. {netTotal.toLocaleString()}) will be paid through credit
                                                </p>
                                                {selectedCustomer?.creditPeriodExpiresAt && (
                                                    <div className="text-xs text-blue-600 pt-2 border-t border-blue-200">
                                                        <div className="flex justify-between">
                                                            <span>Credit Period Expires:</span>
                                                            <span className="font-semibold">
                                                                {new Date(selectedCustomer.creditPeriodExpiresAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {creditPeriodExpired && (
                                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                                                    <p className="text-sm text-red-700 font-semibold">
                                                        ⚠️ Credit period expired!
                                                    </p>
                                                    <p className="text-xs text-red-600 mt-1">
                                                        This customer cannot make credit purchases. Please settle outstanding credit first.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
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
                                {selectedCustomer && selectedCustomer.creditBalance > 0 && (
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
                                                    className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                                                    onClick={() => updateQuantity(p.id, -1)}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={p.quantity}
                                                    onChange={(e) => setDirectQuantity(p.id, e.target.value)}
                                                    onKeyPress={(e) => handleQuantityKeyPress(p.id, e, p.quantity)}
                                                    onBlur={() => handleQuantityBlur(p.id, p.quantity)}
                                                    className="w-16 text-center border rounded p-1 font-semibold"
                                                />
                                                <button
                                                    className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                                                    onClick={() => updateQuantity(p.id, 1)}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
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
                                        disabled={creditPeriodExpired}
                                        className={`py-2 rounded-lg font-medium ${creditPeriodExpired
                                                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                            }`}
                                    >
                                        Print Bill
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
