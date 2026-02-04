import { useState, useEffect } from "react";
import axios from "axios";
import Authenticated from "@/Layouts/AuthenticatedLayout";

export default function ShowProduct({
  product,
  seriasList,
  onUpdated,
}: {
  product: any;
  seriasList: { id: number; seriasNo: string }[];
  onUpdated: (updatedProduct: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...product });
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // 🔹 Auto calculate selling price
  useEffect(() => {
    const buying = parseFloat(form.buyingPrice) || 0;
    const tax = parseFloat(form.tax) || 0;
    const margin = parseFloat(form.profitMargin) || 0;
    const calculated = buying + tax + margin;

    if (!isNaN(calculated)) {
      setForm((prev: any) => ({ ...prev, sellingPrice: calculated.toFixed(2) }));
    }
  }, [form.buyingPrice, form.tax, form.profitMargin]);

  // 🔹 Input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: [] }));
  };

  // 🔹 File change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm({ ...form, productImage: e.target.files[0] });
      setErrors({ ...errors, productImage: [] });
    }
  };

  // 🔹 Submit update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      axios.defaults.withCredentials = true;
      await axios.get("/sanctum/csrf-cookie");

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== null) {
          formData.append(key, value as any);
        }
      });

      // 🛠 PATCH request for updating
      const { data } = await axios.post(`/inventory/${product.id}`, formData, {
        headers: { Accept: "application/json" },
      });

      onUpdated(data.product);
      setSuccessMsg(data.message || "Product updated successfully!");
      setEditing(false);

      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Update error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <Authenticated>
          <div className="p-4 border rounded-lg shadow-sm bg-white max-w-xl mx-auto">
              {successMsg && (
                  <div className="bg-green-100 text-green-700 p-2 rounded mb-3 text-sm">
                      ✅ {successMsg}
                  </div>
              )}

              {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                          {/* Product Name */}
                          <div>
                              <label className="block text-sm font-medium">
                                  Item Name
                              </label>
                              <input
                                  type="text"
                                  name="productName"
                                  value={form.productName}
                                  onChange={handleChange}
                                  className="w-full border p-2 rounded"
                              />
                              {errors.productName && (
                                  <p className="text-red-500 text-sm">
                                      {errors.productName[0]}
                                  </p>
                              )}
                          </div>

                          {/* Part Number */}
                          <div>
                              <label className="block text-sm font-medium">
                                  Part Number
                              </label>
                              <input
                                  type="text"
                                  name="productCode"
                                  value={form.productCode}
                                  onChange={handleChange}
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
                              <label className="block text-sm font-medium">
                                  Vehicle Type
                              </label>
                              <select
                                  name="seriasId"
                                  value={form.seriasId}
                                  onChange={handleChange}
                                  className="w-full border p-2 rounded"
                              >
                                  <option value="">
                                      -- Select Vehicle Type --
                                  </option>
                                  {seriasList?.map((s) => (
                                      <option key={s.id} value={s.id}>
                                          {s.seriasNo}
                                      </option>
                                  ))}
                              </select>
                          </div>

                          {/* Quantity */}
                          <div>
                              <label className="block text-sm font-medium">
                                  Quantity
                              </label>
                              <input
                                  type="number"
                                  name="quantity"
                                  value={form.quantity}
                                  onChange={handleChange}
                                  className="w-full border p-2 rounded"
                              />
                          </div>

                          {/* Buying Price */}
                          <div>
                              <label className="block text-sm font-medium">
                                  Buying Price
                              </label>
                              <input
                                  type="number"
                                  name="buyingPrice"
                                  value={form.buyingPrice}
                                  onChange={handleChange}
                                  className="w-full border p-2 rounded"
                              />
                          </div>

                          {/* Tax */}
                          <div>
                              <label className="block text-sm font-medium">
                                  Tax
                              </label>
                              <input
                                  type="number"
                                  name="tax"
                                  value={form.tax}
                                  onChange={handleChange}
                                  className="w-full border p-2 rounded"
                              />
                          </div>

                          {/* Profit Margin */}
                          <div>
                              <label className="block text-sm font-medium">
                                  Profit Margin
                              </label>
                              <input
                                  type="number"
                                  name="profitMargin"
                                  value={form.profitMargin}
                                  onChange={handleChange}
                                  className="w-full border p-2 rounded"
                              />
                          </div>

                          {/* Selling Price */}
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

                          {/* Batch Number */}
                          <div>
                              <label className="block text-sm font-medium">
                                  Batch Number
                              </label>
                              <input
                                  type="text"
                                  name="batchNumber"
                                  value={form.batchNumber}
                                  onChange={handleChange}
                                  className="w-full border p-2 rounded"
                              />
                          </div>

                          {/* Purchase Date */}
                          <div>
                              <label className="block text-sm font-medium">
                                  Purchase Date
                              </label>
                              <input
                                  type="date"
                                  name="purchaseDate"
                                  value={form.purchaseDate?.split("T")[0] || ""}
                                  onChange={handleChange}
                                  className="w-full border p-2 rounded"
                              />
                          </div>

                          {/* Product Image */}
                          <div className="col-span-2">
                              <label className="block text-sm font-medium">
                                  Product Image
                              </label>
                              <input
                                  type="file"
                                  name="productImage"
                                  onChange={handleFileChange}
                                  className="w-full border p-2 rounded"
                              />
                          </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3">
                          <button
                              type="button"
                              onClick={() => setEditing(false)}
                              className="px-4 py-2 border rounded"
                          >
                              Cancel
                          </button>
                          <button
                              type="submit"
                              disabled={loading}
                              className="px-4 py-2 bg-blue-500 text-white rounded"
                          >
                              {loading ? "Saving..." : "Update"}
                          </button>
                      </div>
                  </form>
              ) : (
                  <div>
                      {/* Display product details */}
                      <h3 className="text-lg font-bold mb-2">
                          {product.productName}
                      </h3>
                      <p>
                          <strong>Code:</strong> {product.productCode}
                      </p>
                      <p>
                          <strong>Quantity:</strong> {product.quantity}
                      </p>
                      <p>
                          <strong>Buying Price:</strong> {product.buyingPrice}
                      </p>
                      <p>
                          <strong>Selling Price:</strong> {product.sellingPrice}
                      </p>
                      <p>
                          <strong>Batch:</strong> {product.batchNumber}
                      </p>
                      <p>
                          <strong>Vehicle Type:</strong>{" "}
                          {seriasList.find((s) => s.id === product.seriasId)
                              ?.seriasNo || "-"}
                      </p>
                      <p>
                          <strong>Vehicle Description:</strong>{" "}
                          {product.productDescription || "-"}
                      </p>
                      {product.productImage && (
                          <img
                              src={`/${product.productImage}`}
                              alt="Product"
                              className="mt-2 w-32 h-32 object-cover"
                          />
                      )}

                      <div className="mt-3 flex gap-2">
                          <button
                              onClick={() => setEditing(true)}
                              className="px-4 py-2 bg-yellow-500 text-white rounded"
                          >
                              Edit
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </Authenticated>
  );
}
