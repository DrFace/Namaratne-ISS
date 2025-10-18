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

  // Payment & totals
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState(0);
  const [balance, setBalance] = useState(0);

  // Calculate total
  const total = cartItems.reduce(
    (sum, p) => sum + p.sellingPrice * p.quantity,
    0
  );

  // Update balance automatically
  useEffect(() => {
    setBalance(total - paidAmount);
  }, [total, paidAmount]);

  // Search filter
  const filteredProducts = initialProducts.filter((p: any) => {
    const matchesName = p.productName
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchesCode = p.productCode
      .toLowerCase()
      .includes(searchCode.toLowerCase());
    return matchesName && matchesCode;
  });

  // Customer search API (auto-suggest)
  useEffect(() => {
    const fetchCustomers = async () => {
      if (customerContact.length >= 3 || customerName.length >= 3) {
        const res = await axios.get(
          `/api/customers/search?query=${customerContact || customerName}`
        );
        setCustomerSuggestions(res.data);
      } else {
        setCustomerSuggestions([]);
      }
    };
    fetchCustomers();
  }, [customerContact, customerName]);

  const handleSelectCustomer = (customer: any) => {
    setCustomerName(customer.name);
    setCustomerContact(customer.contactNumber);
    setCustomerSuggestions([]);
  };

  // Cart management
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
        .map((p) =>
          p.id === id ? { ...p, quantity: p.quantity + delta } : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((p) => p.id !== id));
  };

  // Save sale to backend
  const saveSale = async (status: "draft" | "approved") => {
    try {
      const res = await axios.post("/billing", {
        customerName,
        customerContact,
        cartItems,
        totalAmount: total,
        paidAmount,
        paymentMethod,
        status,
      });
      alert(res.data.message);
      if (status === "approved") {
        setCartItems([]);
        setCustomerName("");
        setCustomerContact("");
        setPaidAmount(0);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error saving sale");
    }
  };

  return (
    <Authenticated>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
          {/* Left: Product list */}
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

          {/* Right: Cart Summary */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Cart Summary
            </h2>

            {/* Customer Fields */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Customer Contact Number"
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

            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mb-3 w-full border rounded p-2"
            />

            {/* Payment section */}
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mb-3 w-full border rounded p-2"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="credit">Credit</option>
            </select>

            <input
              type="number"
              placeholder="Paid Amount"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="mb-3 w-full border rounded p-2"
            />

            {/* Totals */}
            <div className="flex justify-between mb-2">
              <span>Total:</span>
              <span className="font-bold text-green-600">Rs. {total}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Balance:</span>
              <span className="font-semibold text-blue-600">Rs. {balance}</span>
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
