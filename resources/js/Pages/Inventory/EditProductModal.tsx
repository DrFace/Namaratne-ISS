import { useState, useEffect } from "react";
import axios from "axios";

export default function EditProductModal({
  isOpen,
  onClose,
  onUpdated,
  product,
  seriasList,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  product: any;
  seriasList: { id: number; seriasNo: string }[];
}) {
  const [form, setForm] = useState({
    productCode: "",
    productDescription: "",
    unit: "",
    brand: "",
    seriasId: "",
    lowStock: "",
    productImage: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setForm({
        productCode: product.productCode || "",
        productDescription: product.productDescription || "",
        unit: product.unit || "",
        brand: product.brand || "",
        seriasId: product.seriasId?.toString() || "",
        lowStock: product.lowStock?.toString() || "",
        productImage: null,
      });
      // Set existing image preview
      if (product.productImage) {
        setImagePreview(`/${product.productImage}`);
      }
    }
  }, [product]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: [] }));
  };

  // Handle file change with preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setForm({ ...form, productImage: file });
      setErrors({ ...errors, productImage: [] });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      axios.defaults.withCredentials = true;
      await axios.get("/sanctum/csrf-cookie");

      const formData = new FormData();
      formData.append("_method", "PUT");

      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== null) {
          formData.append(key, value as any);
        }
      });

      await axios.post(`/inventory/${product.id}`, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onUpdated();
        onClose();
        window.location.reload();
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
        <h2 className="text-lg font-bold mb-4">Edit Product: {product?.productName}</h2>

        {showSuccess && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-2 text-sm">
            ✅ Product updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
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
              {errors.unit && (
                <p className="text-red-500 text-sm">{errors.unit[0]}</p>
              )}
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
              {errors.brand && (
                <p className="text-red-500 text-sm">{errors.brand[0]}</p>
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

            {/* Low Stock */}
            <div>
              <label className="block text-sm font-medium">Low Stock Level</label>
              <input
                type="number"
                name="lowStock"
                value={form.lowStock}
                onChange={handleChange}
                placeholder="Low Stock Level"
                className="w-full border p-2 rounded"
              />
              {errors.lowStock && (
                <p className="text-red-500 text-sm">
                  {errors.lowStock[0]}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="productDescription"
                value={form.productDescription}
                onChange={handleChange}
                placeholder="Description"
                rows={3}
                className="w-full border p-2 rounded"
              />
              {errors.productDescription && (
                <p className="text-red-500 text-sm">
                  {errors.productDescription[0]}
                </p>
              )}
            </div>

            {/* Product Image */}
            <div className="col-span-2">
              <label className="block text-sm font-medium">Product Image</label>
              {imagePreview && (
                <div className="mb-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
              <input
                type="file"
                name="productImage"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max 2MB. Formats: JPG, PNG, WebP
              </p>
              {errors.productImage && (
                <p className="text-red-500 text-sm">
                  {errors.productImage[0]}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
