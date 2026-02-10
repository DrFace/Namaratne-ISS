import Authenticated from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus, X } from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { toast } from "react-toastify";
import Breadcrumbs from "@/Components/UI/Breadcrumbs";
import EmptyState from "@/Components/UI/EmptyState";
import Badge from "@/Components/UI/Badge";
import { ShoppingCart, Search, Users, Package } from "lucide-react";

export default function Billing({ products: initialProducts }: any) {
    const [searchName, setSearchName] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false); // Mobile cart toggle

    // Customer fields
    const [customerName, setCustomerName] = useState("");
    const [customerContact, setCustomerContact] = useState("");
    const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

    // Discount fields
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
        "fixed",
    );

    // Payment fields
    const [paymentType, setPaymentType] = useState<"cash" | "credit">("cash");
    const [cashAmount, setCashAmount] = useState(0);
    const [balance, setBalance] = useState(0);

    // Currency selection
    const [displayCurrency, setDisplayCurrency] = useState<"LKR" | "USD">(
        "LKR",
    );
    const [exchangeRate, setExchangeRate] = useState<number>(320);

    // Fetch exchange rate on mount
    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await axios.get("/api/currency/rate");
                const rate = Number(response.data?.rate);
                setExchangeRate(
                    !Number.isFinite(rate) || rate <= 0 ? 320 : rate,
                );
            } catch (error) {
                console.error("Error fetching exchange rate:", error);
            }
        };
        fetchExchangeRate();
    }, []);

    // Helper functions for currency conversion
    const convertPrice = (lkrAmount: number | string): number => {
        const amount =
            typeof lkrAmount === "string" ? parseFloat(lkrAmount) : lkrAmount;

        if (!Number.isFinite(amount)) return 0;

        if (displayCurrency === "USD") {
            const rate = Number(exchangeRate);
            if (!Number.isFinite(rate) || rate <= 0) return 0;
            return amount / rate;
        }
        return amount;
    };

    const formatCurrency = (amount: number | string): string => {
        const num = typeof amount === "string" ? parseFloat(amount) : amount;
        const safe = Number.isFinite(num) ? num : 0;

        if (displayCurrency === "USD") {
            return `$${safe.toFixed(2)}`;
        }
        return `Rs. ${safe.toFixed(2)}`;
    };

    // ✅ Totals (MATCH InvoicePrint)
    // GOODS VALUE
    const goodsValue = cartItems.reduce((sum, p) => {
        const price = Number(p.sellingPrice);
        const qty = Number(p.quantity);
        return (
            sum +
            (Number.isFinite(price) ? price : 0) *
                (Number.isFinite(qty) ? qty : 0)
        );
    }, 0);

    // DISCOUNT amount
    const discountAmount =
        discountType === "percentage"
            ? (goodsValue * discountValue) / 100
            : discountValue;

    // TOTAL after discount
    const totalAfterDiscount = Math.max(0, goodsValue - discountAmount);

    // VAT 18% portion (VAT-inclusive formula from InvoicePrint)
    // VAT 18% = TOTAL - {(TOTAL*100)/118}
    const vatAmount = totalAfterDiscount - (totalAfterDiscount * 100) / 118;

    // GRAND TOTAL
    const grandTotal = totalAfterDiscount + vatAmount;

    // Paid amount
    const paidAmount = paymentType === "cash" ? cashAmount : grandTotal;

    // Check if customer can purchase (credit period not expired)
    const canCustomerPurchase = selectedCustomer?.canPurchase !== false;
    const creditPeriodExpired =
        paymentType === "credit" && !canCustomerPurchase;

    useEffect(() => {
        setBalance(grandTotal - paidAmount);
    }, [grandTotal, paidAmount]);

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

        if (query.length >= 2) {
            setIsSearchingCustomer(true);
        } else {
            setCustomerSuggestions([]);
            setIsSearchingCustomer(false);
        }

        const fetchCustomers = async () => {
            if (query.length >= 2) {
                try {
                    const res = await axios.get(
                        `/customers/search?query=${query}`,
                    );
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

    const selectCustomer = (customer: any) => {
        setSelectedCustomer(customer);
        setCustomerName(customer.name);
        setCustomerContact(customer.contactNumber);
        setCustomerSuggestions([]);
        setIsSearchingCustomer(false);

        // Set discount from category if available
        if (customer.discount_category) {
            setDiscountValue(customer.discount_category.value || 0);
            setDiscountType(
                customer.discount_category.type === "percentage"
                    ? "percentage"
                    : "fixed",
            );
        } else {
            setDiscountValue(0);
            setDiscountType("fixed");
        }
    };

    // Cart actions
    const addToCart = (product: any) => {
        const existing = cartItems.find((p) => p.id === product.id);
        if (existing) {
            if (existing.quantity + 1 > product.quantity) {
                toast.warning(
                    `Cannot add more. Only ${product.quantity} items available in stock.`,
                );
                return;
            }
            setCartItems(
                cartItems.map((p) =>
                    p.id === product.id
                        ? { ...p, quantity: p.quantity + 1 }
                        : p,
                ),
            );
        } else {
            if (product.quantity < 1) {
                toast.error("Product is out of stock.");
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
                        const newQuantity = Number(p.quantity) + delta;

                        const originalProduct = initialProducts.find(
                            (prod: any) => prod.id === id,
                        );
                        const maxStock = Number(originalProduct?.quantity || 0);

                        if (newQuantity > maxStock) {
                            toast.warning(
                                `Cannot add more. Only ${maxStock} items available in stock.`,
                            );
                            return p;
                        }

                        return { ...p, quantity: newQuantity };
                    }
                    return p;
                })
                .filter((p) => Number(p.quantity) > 0),
        );
    };

    const setDirectQuantity = (id: number, value: string) => {
        if (value === "") {
            setCartItems(
                cartItems.map((p) =>
                    p.id === id ? { ...p, quantity: "" as any } : p,
                ),
            );
            return;
        }

        const numValue = parseInt(value, 10);

        if (isNaN(numValue)) return;

        const originalProduct = initialProducts.find(
            (prod: any) => prod.id === id,
        );
        const maxStock = Number(originalProduct?.quantity || 0);

        if (numValue > maxStock) {
            toast.warning(
                `Cannot add more. Only ${maxStock} items available in stock.`,
            );
            return;
        }

        setCartItems(
            cartItems.map((p) =>
                p.id === id ? { ...p, quantity: numValue } : p,
            ),
        );
    };

    const handleQuantityKeyPress = (
        id: number,
        e: React.KeyboardEvent<HTMLInputElement>,
        currentValue: any,
    ) => {
        if (e.key === "Enter") {
            const numValue = parseInt(String(currentValue), 10);
            if (isNaN(numValue) || numValue < 1) {
                setCartItems(cartItems.filter((p) => p.id !== id));
            }
        }
    };

    const handleQuantityBlur = (id: number, currentValue: any) => {
        const numValue = parseInt(String(currentValue), 10);
        if (isNaN(numValue) || numValue < 1) {
            setCartItems(cartItems.filter((p) => p.id !== id));
        }
    };

    const removeItem = (id: number) => {
        setCartItems(cartItems.filter((p) => p.id !== id));
    };

    // Save sale
    const saveSale = async (status: "draft" | "approved") => {
        if (status === "approved" && creditPeriodExpired) {
            toast.error(
                "Cannot approve sale: Customer's credit period has expired! Please settle outstanding credit first.",
            );
            return;
        }

        // ✅ Cash validation must be against GRAND TOTAL
        if (
            status === "approved" &&
            paymentType === "cash" &&
            cashAmount < grandTotal
        ) {
            toast.error(
                "Cash amount must be greater than or equal to the grand total!",
            );
            return;
        }

        try {
            const res = await axios.post("/billing", {
                customerId: selectedCustomer?.id,
                customerName,
                customerContact,
                cartItems,

                // ✅ store base values in LKR
                totalAmount: goodsValue,
                discountValue,
                discountType,
                discountAmount,

                // ✅ Align with invoice math (so index == print)
                netTotal: grandTotal,
                paidAmount,
                cashAmount: paymentType === "cash" ? cashAmount : 0,
                cardAmount: 0,
                creditAmount: paymentType === "credit" ? grandTotal : 0,

                balance,
                paymentMethod: paymentType,
                status,
            });

            const saleId = res.data.sale?.id;
            toast.success(res.data.message);

            if (status === "approved" && saleId) {
                const currencyParam =
                    displayCurrency === "USD" ? "?currency=USD" : "";
                window.open(
                    `/billing/print/${saleId}${currencyParam}`,
                    "_blank",
                );

                // Reset
                setCartItems([]);
                setCustomerName("");
                setCustomerContact("");
                setSelectedCustomer(null);
                setPaymentType("cash");
                setCashAmount(0);
                setDiscountValue(0);
                setDiscountType("fixed");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Error saving sale");
        }
    };
    
    // Close cart on large screens or when clicking outside (optional)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                setIsCartOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Authenticated>
            <div className="min-h-screen bg-gray-50/50 p-6 space-y-6 animate-premium-in">
                <Breadcrumbs items={[{ label: 'Billing', href: route('billing.index') }]} />
                
                <div className="max-w-8xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                                            {customerSuggestions.map(
                                                (customer) => (
                                                    <div
                                                        key={customer.id}
                                                        onClick={() =>
                                                            selectCustomer(
                                                                customer,
                                                            )
                                                        }
                                                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                                                    >
                                                        <div className="font-semibold text-lg text-gray-800">
                                                            {customer.name}
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            {
                                                                customer.contactNumber
                                                            }
                                                        </div>
                                                        {customer.email && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {customer.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ) : (customerName || customerContact) &&
                                  (customerName.length >= 2 ||
                                      customerContact.length >= 2) ? (
                                    <EmptyState 
                                        title="No Customers Found" 
                                        description="No records match your search query." 
                                        icon={Users}
                                        action={{
                                            label: "Add New Customer",
                                            onClick: () => router.visit("/customer")
                                        }}
                                    />
                                ) : (
                                    <EmptyState 
                                        title="Search for a Customer" 
                                        description="Enter a name or contact number in the right panel to begin." 
                                        icon={Search}
                                    />
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Search by Name"
                                        value={searchName}
                                        onChange={(e) =>
                                            setSearchName(e.target.value)
                                        }
                                        className="w-full border rounded p-2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search by Code"
                                        value={searchCode}
                                        onChange={(e) =>
                                            setSearchCode(e.target.value)
                                        }
                                        className="w-full border rounded p-2"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                                    {filteredProducts.map((product: any) => (
                                        <div
                                            key={product.id}
                                            className="group bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                                        >
                                            <div className="space-y-2">
                                                <div className="font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3rem]">
                                                    {product.productName}
                                                </div>

                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 uppercase tracking-wider font-semibold">SKU: {product.productCode}</span>
                                                    <Badge variant={product.quantity > (product.lowStock || 5) ? 'success' : 'warning'}>
                                                        {product.quantity} in stock
                                                    </Badge>
                                                </div>

                                                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums py-2">
                                                    {formatCurrency(
                                                        convertPrice(
                                                            product.sellingPrice,
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className="mt-4 w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                                onClick={() =>
                                                    addToCart(product)
                                                }
                                            >
                                                <Plus className="w-4 h-4" /> Add to Cart
                                            </button>
                                        </div>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="col-span-full py-12">
                                            <EmptyState 
                                                title="No Products Found" 
                                                description={`We couldn't find any products matching "${searchName || searchCode}"`}
                                                icon={Package}
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Cart Toggle */}
                    <div className="fixed bottom-4 left-4 right-4 z-40 xl:hidden">
                        <button 
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            className="w-full bg-indigo-600 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Total</div>
                                    <div className="text-xl font-black">{formatCurrency(convertPrice(grandTotal))}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 font-bold bg-white/10 px-4 py-2 rounded-xl">
                                <span>{isCartOpen ? 'Close Cart' : 'View Cart'}</span>
                                <div className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    {cartItems.length}
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Cart & Payment Section */}
                    <div className={`
                        fixed inset-0 z-50 bg-white xl:bg-transparent xl:static xl:z-auto xl:flex flex-col 
                        transition-transform duration-300 ease-in-out
                        ${isCartOpen ? 'translate-y-0' : 'translate-y-full xl:translate-y-0'}
                    `}>
                        {/* Mobile Header for Cart */}
                        <div className="xl:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-[60]">
                             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" /> Current Sale
                             </h2>
                             <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                <X className="w-5 h-5 text-gray-500" />
                             </button>
                        </div>

                        <div className="bg-white rounded-xl shadow h-full overflow-y-auto p-4 flex flex-col xl:h-auto">
                            <h2 className="text-lg font-semibold mb-4 border-b pb-2 hidden xl:block">
                                {selectedCustomer
                                    ? "Cart Summary"
                                    : "Select Customer"}
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
                                    <label className="font-semibold">
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter name"
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(e.target.value)
                                        }
                                        className="w-full border rounded p-2"
                                        autoFocus
                                    />
                                </div>

                                <div className="relative mb-3">
                                    <label className="font-semibold">
                                        Customer Contact
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter contact number"
                                        value={customerContact}
                                        onChange={(e) =>
                                            setCustomerContact(e.target.value)
                                        }
                                        className="w-full border rounded p-2"
                                    />
                                </div>

                                <div className="text-xs text-gray-500 mt-2">
                                    Tip: Start typing to search existing
                                    customers
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-green-900">
                                                {customerName}
                                            </p>
                                            <p className="text-sm text-green-700">
                                                {customerContact}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedCustomer(null);
                                                setCustomerName("");
                                                setCustomerContact("");
                                                setCartItems([]);
                                                setPaymentType("cash");
                                                setCashAmount(0);
                                                setDiscountValue(0);
                                                setDiscountType("fixed");
                                            }}
                                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>

                                {/* Discounts */}
                                <div className="text-sm text-gray-700 mb-3">
                                    Discount:{" "}
                                    <span className="font-semibold">
                                        {selectedCustomer?.discount_category ? (
                                            <>
                                                {
                                                    selectedCustomer
                                                        .discount_category.name
                                                }{" "}
                                                (
                                                {discountType === "percentage"
                                                    ? `${discountValue}%`
                                                    : `Rs. ${discountValue}`}
                                                )
                                            </>
                                        ) : discountType === "percentage" ? (
                                            `${discountValue}%`
                                        ) : (
                                            `Rs. ${discountValue}`
                                        )}
                                    </span>
                                </div>

                                {/* Payment */}
                                <div className="space-y-2 mb-3">
                                    <label className="font-semibold">
                                        Payment Type
                                    </label>
                                    <select
                                        value={paymentType}
                                        onChange={(e) => {
                                            setPaymentType(
                                                e.target.value as
                                                    | "cash"
                                                    | "credit",
                                            );
                                            setCashAmount(0);
                                        }}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="credit">Credit</option>
                                    </select>

                                    {paymentType === "cash" && (
                                        <>
                                            <label className="font-semibold mt-2">
                                                Cash Amount
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Enter cash amount"
                                                value={
                                                    cashAmount === 0
                                                        ? ""
                                                        : cashAmount
                                                }
                                                onChange={(e) =>
                                                    setCashAmount(
                                                        e.target.value === ""
                                                            ? 0
                                                            : Number(
                                                                  e.target
                                                                      .value,
                                                              ),
                                                    )
                                                }
                                                className="w-full border rounded p-2"
                                            />
                                        </>
                                    )}

                                    {paymentType === "credit" && (
                                        <>
                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded space-y-2">
                                                <p className="text-sm text-blue-700">
                                                    Full amount (Rs.{" "}
                                                    {grandTotal.toLocaleString()}
                                                    ) will be paid through
                                                    credit
                                                </p>
                                                {selectedCustomer?.creditPeriodExpiresAt && (
                                                    <div className="text-xs text-blue-600 pt-2 border-t border-blue-200">
                                                        <div className="flex justify-between">
                                                            <span>
                                                                Credit Period
                                                                Expires:
                                                            </span>
                                                            <span className="font-semibold">
                                                                {new Date(
                                                                    selectedCustomer.creditPeriodExpiresAt,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {creditPeriodExpired && (
                                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                                                    <p className="text-sm text-red-700 font-semibold">
                                                        ⚠️ Credit period
                                                        expired!
                                                    </p>
                                                    <p className="text-xs text-red-600 mt-1">
                                                        This customer cannot
                                                        make credit purchases.
                                                        Please settle
                                                        outstanding credit
                                                        first.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Currency Selector */}
                                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Invoice Display Currency
                                    </label>
                                    <div className="flex gap-3">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                value="LKR"
                                                checked={
                                                    displayCurrency === "LKR"
                                                }
                                                onChange={() =>
                                                    setDisplayCurrency("LKR")
                                                }
                                                className="mr-2"
                                            />
                                            <span className="text-sm">
                                                LKR (රු)
                                            </span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                value="USD"
                                                checked={
                                                    displayCurrency === "USD"
                                                }
                                                onChange={() =>
                                                    setDisplayCurrency("USD")
                                                }
                                                className="mr-2"
                                            />
                                            <span className="text-sm">
                                                USD ($)
                                            </span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Select currency for invoice display
                                        (stored as LKR)
                                    </p>
                                </div>

                                {/* ✅ Totals (MATCH InvoicePrint labels) */}
                                <div className="flex justify-between mb-1">
                                    <span>Goods Value:</span>
                                    <span className="font-semibold">
                                        {formatCurrency(
                                            convertPrice(goodsValue),
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between mb-1">
                                    <span>
                                        Discount
                                        {selectedCustomer?.discount_category
                                            ?.name
                                            ? ` (${selectedCustomer.discount_category.name})`
                                            : ""}
                                        :
                                    </span>
                                    <span className="font-semibold text-green-600">
                                        -{" "}
                                        {formatCurrency(
                                            convertPrice(discountAmount),
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between mb-1">
                                    <span>Total:</span>
                                    <span className="font-bold text-blue-600">
                                        {formatCurrency(
                                            convertPrice(totalAfterDiscount),
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between mb-1">
                                    <span>VAT 18%:</span>
                                    <span className="font-semibold">
                                        {formatCurrency(
                                            convertPrice(vatAmount),
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between mb-1">
                                    <span>Grand Total:</span>
                                    <span className="font-bold text-blue-600">
                                        {formatCurrency(
                                            convertPrice(grandTotal),
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between mb-4">
                                    <span>Balance:</span>
                                    <span className="font-bold text-red-500">
                                        {formatCurrency(convertPrice(balance))}
                                    </span>
                                </div>

                                {/* Cart Items */}
                                <div className="flex-1 overflow-y-auto mb-4 border-t pt-2">
                                    {cartItems.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex justify-between items-center border-b py-2"
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {p.productName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatCurrency(
                                                        convertPrice(
                                                            p.sellingPrice,
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                                                    onClick={() =>
                                                        updateQuantity(p.id, -1)
                                                    }
                                                >
                                                    <Minus size={14} />
                                                </button>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={p.quantity}
                                                    onChange={(e) =>
                                                        setDirectQuantity(
                                                            p.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyPress={(e) =>
                                                        handleQuantityKeyPress(
                                                            p.id,
                                                            e,
                                                            p.quantity,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        handleQuantityBlur(
                                                            p.id,
                                                            p.quantity,
                                                        )
                                                    }
                                                    className="w-16 text-center border rounded p-1 font-semibold"
                                                />

                                                <button
                                                    className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                                                    onClick={() =>
                                                        updateQuantity(p.id, 1)
                                                    }
                                                >
                                                    <Plus size={14} />
                                                </button>

                                                <button
                                                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                                                    onClick={() =>
                                                        removeItem(p.id)
                                                    }
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
                                        className={`py-2 rounded-lg font-medium ${
                                            creditPeriodExpired
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
            </div>
        </Authenticated>
    );
}
