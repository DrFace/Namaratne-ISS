import { useState } from "react";
import { usePage } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import MasterTable, {
    TableBody,
    TableTd,
} from "@/Components/elements/tables/masterTable";
import CreateProductModal from "./CreateProductModal";
import CreateSeriasModal from "./CreateSeriasModal";
import AddStockModal from "./AddStockModal";
import EditProductModal from "./EditProductModal";
import { PencilIcon } from "@heroicons/react/20/solid";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import ConfirmButton from "@/Components/elements/buttons/ConfirmButton";
import { PrimaryLink } from "@/Components/elements/buttons/PrimaryButton";
import { format, parseISO } from "date-fns"; // ✅ ADDED

export default function ProductsIndexPage() {
    const {
        products: initialProducts,
        seriasList,
        permissions,
        isAdmin,
    } = usePage().props as any;

    // ✅ ADDED (only helper)
    const formatDate = (value?: string | null) => {
        if (!value) return "-";
        try {
            return format(parseISO(value), "dd MMM yyyy, hh:mm a");
        } catch {
            // if backend sends "YYYY-MM-DD" or any other format that parseISO can't parse safely
            try {
                return format(new Date(value), "dd MMM yyyy, hh:mm a");
            } catch {
                return value;
            }
        }
    };

    // State: products object (paginated)
    const [products, setProducts] = useState(initialProducts);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSeriasModalOpen, setIsSeriasModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Helper function to check permissions
    const hasPermission = (permission: string) => {
        if (isAdmin) return true;
        return permissions && permissions.includes(permission);
    };

    // When a new product is created, merge into .data
    const handleProductCreated = (newProduct: any) => {
        setProducts((prev: any) => ({
            ...prev,
            data: [...prev.data, newProduct],
        }));
    };

    const handleSeriasCreated = (newSerias: any) => {
        console.log("New series added:", newSerias);
    };

    const handleStockAdded = (newStock: any) => {
        console.log("Stock added:", newStock);
        window.location.reload();
    };

    const tableColumns = [
        { label: "", sortField: "", sortable: false },
        { label: "ID", sortField: "id", sortable: true },
        { label: "Item name", sortField: "productName", sortable: true },

        // ✅ NEW
        { label: "Part Number", sortField: "productCode", sortable: true },
        {
            label: "Vehicle Description",
            sortField: "productDescription",
            sortable: true,
        },

        { label: "Vehicle Type", sortField: "seriasNo", sortable: true },
        { label: "Buying Price", sortField: "buyingPrice", sortable: true },
        { label: "Selling Price", sortField: "sellingPrice", sortable: true },
        { label: "Quantity", sortField: "quantity", sortable: true },
        { label: "Purchase Date", sortField: "purchaseDate", sortable: true },
        { label: "Availability", sortField: "availability", sortable: true },
    ];

    const filters = {};
    const createLink = undefined;

    // Permission checks
    const canAddStock = hasPermission("restock_products");
    const canAddProduct = hasPermission("add_products");
    const canAddSeries = hasPermission("add_series");

    return (
        <Authenticated bRoutes={undefined}>
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Products</h2>
                    <div className="flex gap-2">
                        {/* Add Stock Button */}
                        <div className="relative group">
                            <button
                                onClick={() =>
                                    canAddStock && setIsStockModalOpen(true)
                                }
                                disabled={!canAddStock}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                    canAddStock
                                        ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                {!canAddStock && (
                                    <LockClosedIcon className="w-4 h-4" />
                                )}
                                Add Stock
                            </button>
                            {!canAddStock && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    You don't have permission to add stock
                                </div>
                            )}
                        </div>

                        {/* Add Product Button */}
                        <div className="relative group">
                            <button
                                onClick={() =>
                                    canAddProduct && setIsProductModalOpen(true)
                                }
                                disabled={!canAddProduct}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                    canAddProduct
                                        ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                {!canAddProduct && (
                                    <LockClosedIcon className="w-4 h-4" />
                                )}
                                Add Product
                            </button>
                            {!canAddProduct && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    You don't have permission to add products
                                </div>
                            )}
                        </div>

                        {/* Add Series Button */}
                        <div className="relative group">
                            <button
                                onClick={() =>
                                    canAddSeries && setIsSeriasModalOpen(true)
                                }
                                disabled={!canAddSeries}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                    canAddSeries
                                        ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                {!canAddSeries && (
                                    <LockClosedIcon className="w-4 h-4" />
                                )}
                                Add Vehical Type
                            </button>
                            {!canAddSeries && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    You don't have permission to add Vehicle
                                    Type
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <MasterTable
                    tableColumns={tableColumns}
                    filters={filters}
                    url={route("products.index")}
                    createLink={createLink}
                    links={products.meta?.links}
                >
                    {products.data.map((product: any) => (
                        <TableBody
                            key={product.id}
                            id={product.id}
                            buttons={
                                <>
                                    <button
                                        onClick={() => {
                                            if (
                                                hasPermission("edit_products")
                                            ) {
                                                setSelectedProduct(product);
                                                setIsEditModalOpen(true);
                                            }
                                        }}
                                        disabled={
                                            !hasPermission("edit_products")
                                        }
                                        className={`flex items-center gap-1 px-3 py-2 text-sm rounded ${
                                            hasPermission("edit_products")
                                                ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                    >
                                        <PencilIcon className="w-3 h-3" /> Edit
                                    </button>
                                    <ConfirmButton
                                        className="!py-2"
                                        url={`/products/${product.id}`}
                                        label="Delete"
                                        disabled={
                                            !hasPermission("delete_products")
                                        }
                                    />
                                </>
                            }
                        >
                            <TableTd>{product.id}</TableTd>
                            <TableTd>{product.productName}</TableTd>

                            {/* ✅ NEW */}
                            <TableTd>{product.productCode ?? "-"}</TableTd>
                            <TableTd>
                                {product.productDescription ?? "-"}
                            </TableTd>

                            <TableTd>
                                {seriasList.find(
                                    (s: any) => s.id === product.seriasId,
                                )?.seriasNo ?? "-"}
                            </TableTd>
                            <TableTd>LKR {product.buyingPrice ?? "-"}</TableTd>
                            <TableTd>LKR {product.sellingPrice ?? "-"}</TableTd>
                            <TableTd>{product.quantity}</TableTd>

                            {/* ✅ CHANGED ONLY THIS (humanize purchaseDate) */}
                            <TableTd>
                                {formatDate(product.purchaseDate)}
                            </TableTd>

                            <TableTd>
                                <div
                                    className={`font-semibold ${product.quantity > 0 ? "text-green-500" : "text-red-500"}`}
                                >
                                    {product.quantity > 0
                                        ? "In-stock"
                                        : "Out of stock"}
                                </div>
                            </TableTd>
                        </TableBody>
                    ))}
                </MasterTable>

                {/* Modals */}
                <CreateProductModal
                    isOpen={isProductModalOpen}
                    onClose={() => setIsProductModalOpen(false)}
                    onCreated={handleProductCreated}
                    seriasList={seriasList}
                />
                <CreateSeriasModal
                    isOpen={isSeriasModalOpen}
                    onClose={() => setIsSeriasModalOpen(false)}
                    onCreated={handleSeriasCreated}
                />
                <AddStockModal
                    isOpen={isStockModalOpen}
                    onClose={() => setIsStockModalOpen(false)}
                    onStockAdded={handleStockAdded}
                    productsList={products.data}
                />
                <EditProductModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdated={() => window.location.reload()}
                    product={selectedProduct}
                    seriasList={seriasList}
                />
            </div>
        </Authenticated>
    );
}
