import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PencilIcon, TrashIcon, PlusIcon, UserGroupIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

interface DiscountCategory {
  id: number;
  name: string;
  type: "amount" | "percentage";
  value: number;
  description?: string;
  status: "active" | "inactive";
  customers_count: number;
  customers?: Customer[];
}

interface Customer {
  id: number;
  customerId: string;
  name: string;
  discount_category_id?: number;
}

export default function DiscountCategoriesIndex() {
  const props = usePage().props;
  const { categories: propsCategories, allCustomers } = props as any;
  const [categories, setCategories] = useState(propsCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomersModalOpen, setIsCustomersModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DiscountCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DiscountCategory | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  // Update categories when props change (after reload)
  useEffect(() => {
    setCategories(propsCategories);
    // Update selected category if modal is open
    if (selectedCategory) {
      const updatedCategory = propsCategories.find((c: DiscountCategory) => c.id === selectedCategory.id);
      if (updatedCategory) {
        setSelectedCategory(updatedCategory);
      }
    }
  }, [propsCategories]);

  const [form, setForm] = useState({
    name: "",
    type: "amount" as "amount" | "percentage",
    value: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  const resetForm = () => {
    setForm({
      name: "",
      type: "amount",
      value: "",
      description: "",
      status: "active",
    });
    setEditingCategory(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (category: DiscountCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      type: category.type,
      value: category.value.toString(),
      description: category.description || "",
      status: category.status,
    });
    setIsModalOpen(true);
  };

  const openCustomersModal = (category: DiscountCategory) => {
    setSelectedCategory(category);
    setSelectedCustomerId("");
    setIsCustomersModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingCategory
      ? route("discount-categories.update", editingCategory.id)
      : route("discount-categories.store");

    const method = editingCategory ? "put" : "post";

    router[method](url, form, {
      onSuccess: () => {
        toast.success(`Discount category ${editingCategory ? "updated" : "created"} successfully!`);
        setIsModalOpen(false);
        resetForm();
        router.reload();
      },
      onError: (errors) => {
        toast.error("Error saving discount category");
        console.error(errors);
      },
    });
  };

  const handleDelete = (category: DiscountCategory) => {
    if (category.customers_count > 0) {
      toast.error(`Cannot delete category "${category.name}" - it has ${category.customers_count} assigned customers`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    router.delete(route("discount-categories.destroy", category.id), {
      onSuccess: () => {
        toast.success("Discount category deleted successfully!");
        router.reload();
      },
      onError: () => {
        toast.error("Error deleting discount category");
      },
    });
  };

  const handleAssignCustomer = () => {
    if (!selectedCategory || !selectedCustomerId) return;

    router.post(
      route("discount-categories.assign-customer", selectedCategory.id),
      { customer_id: selectedCustomerId },
      {
        onSuccess: () => {
          toast.success("Customer assigned successfully!");
          setSelectedCustomerId("");
          router.reload();
        },
        onError: () => {
          toast.error("Error assigning customer");
        },
      }
    );
  };

  const handleRemoveCustomer = (customerId: number) => {
    if (!selectedCategory) return;

    if (!confirm("Remove this customer from the category?")) return;

    router.delete(route("discount-categories.remove-customer", [selectedCategory.id, customerId]), {
      onSuccess: () => {
        toast.success("Customer removed successfully!");
        router.reload();
      },
      onError: () => {
        toast.error("Error removing customer");
      },
    });
  };

  // Filter available customers (not in this category)
  const availableCustomers = allCustomers?.filter(
    (customer: Customer) => customer.discount_category_id !== selectedCategory?.id
  ) || [];

  return (
    <Authenticated>
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Discount Categories</h2>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Category
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No discount categories found. Create one to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category: DiscountCategory) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{category.name}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{category.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      {category.type === "percentage" ? `${category.value}%` : `Rs. ${category.value}`}
                    </td>
                    <td className="px-6 py-4">{category.customers_count}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${category.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openCustomersModal(category)}
                        className="text-green-600 hover:text-green-800"
                        title="Manage Customers"
                      >
                        <UserGroupIcon className="w-5 h-5 inline" />
                      </button>
                      <button onClick={() => openEditModal(category)} className="text-blue-600 hover:text-blue-800">
                        <PencilIcon className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="text-red-600 hover:text-red-800"
                        disabled={category.customers_count > 0}
                      >
                        <TrashIcon className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create/Edit Category Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{editingCategory ? "Edit" : "Create"} Discount Category</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                    placeholder="e.g., VIP Discount, Wholesale 10%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "amount" | "percentage" })}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="amount">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Value * {form.type === "percentage" ? "(0-100)" : "(Rs.)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                    min="0"
                    max={form.type === "percentage" ? "100" : undefined}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border rounded p-2"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingCategory ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Customers Modal */}
        {isCustomersModalOpen && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-2">Manage Customers</h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedCategory.name} - {selectedCategory.type === "percentage" ? `${selectedCategory.value}%` : `Rs. ${selectedCategory.value}`}
              </p>

              {/* Assigned Customers List */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Assigned Customers ({selectedCategory.customers?.length || 0})</h4>
                <div className="border rounded max-h-48 overflow-y-auto">
                  {selectedCategory.customers && selectedCategory.customers.length > 0 ? (
                    <ul className="divide-y">
                      {selectedCategory.customers.map((customer: Customer) => (
                        <li key={customer.id} className="flex justify-between items-center px-3 py-2 hover:bg-gray-50">
                          <span>
                            {customer.customerId} - {customer.name}
                          </span>
                          <button
                            onClick={() => handleRemoveCustomer(customer.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-3 py-4 text-center text-gray-500 text-sm">No customers assigned yet</p>
                  )}
                </div>
              </div>

              {/* Add Customer */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Add Customer</h4>
                <div className="flex gap-2">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="flex-1 border rounded p-2"
                  >
                    <option value="">Select a customer...</option>
                    {availableCustomers.map((customer: Customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.customerId} - {customer.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignCustomer}
                    disabled={!selectedCustomerId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Assign
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setIsCustomersModalOpen(false);
                    setSelectedCategory(null);
                    setSelectedCustomerId("");
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Authenticated>
  );
}
