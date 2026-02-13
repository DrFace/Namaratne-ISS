import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import MasterTable, {
    TableBody,
    TableTd,
} from "@/Components/elements/tables/masterTable";
import CreateProductModal from "./CreateProductModal";
import CreateSeriasModal from "./CreateSeriasModal";
import AddStockModal from "./AddStockModal";
import EditProductModal from "./EditProductModal";
import BulkEditModal from "./BulkEditModal";
import { PencilIcon } from "@heroicons/react/20/solid";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import ConfirmButton from "@/Components/elements/buttons/ConfirmButton";
import { format, parseISO } from "date-fns";
import Breadcrumbs from "@/Components/UI/Breadcrumbs";
import EmptyState from "@/Components/UI/EmptyState";
import { Plus, RefreshCw, Trash2, Box, Download, FileSpreadsheet } from "lucide-react";
import axios from "axios";
import DataTable from "@/Components/UI/DataTable";
import AdvancedFilter, { FilterOption } from "@/Components/UI/AdvancedFilter";
import { useEntities } from "@/hooks/useEntities";
import { TableSkeleton } from "@/Components/UI/Skeleton";
import Badge from "@/Components/UI/Badge";
import Card from "@/Components/UI/Card";
import Button from "@/Components/UI/Button";
import classNames from "classnames";

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

    const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');

    // React Query for data management
    const { 
        data: productsData, 
        isLoading, 
        remove: deleteProduct,
        refetch 
    } = useEntities<any>('products', '/api/v1/products', {
        ...currentFilters,
        search: searchQuery,
        initialData: initialProducts // ✅ Pass initial data
    });

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSeriasModalOpen, setIsSeriasModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

    const filterOptions: FilterOption[] = [
        { 
            key: 'seriasId', 
            label: 'Vehicle Type', 
            type: 'select', 
            options: seriasList.map((s: any) => ({ label: s.seriasNo, value: s.id }))
        },
        { key: 'min_price', label: 'Min Price', type: 'number' },
        { key: 'max_price', label: 'Max Price', type: 'number' },
        { key: 'in_stock', label: 'Stock Status', type: 'select', options: [
            { label: 'In Stock', value: '1' },
            { label: 'Out of Stock', value: '0' }
        ]}
    ];

    const columns = [
        { header: "ID", accessor: "id", sortable: true },
        { header: "Product", accessor: (item: any) => (
            <div className="flex flex-col">
                <span className="font-bold text-gray-900 dark:text-white">{item.productName}</span>
                <span className="text-xs text-gray-500">{item.productCode}</span>
            </div>
        ), sortable: true },
        { header: "Vehicle Type", accessor: (item: any) => (
            <Badge variant="neutral">{seriasList.find((s: any) => s.id === item.seriasId)?.seriasNo || '-'}</Badge>
        )},
        { header: "Prices", accessor: (item: any) => (
            <div className="flex flex-col text-xs">
                <span className="text-gray-400 italic">Buy: Rs. {item.buyingPrice}</span>
                <span className="font-bold text-indigo-600">Sell: Rs. {item.sellingPrice}</span>
            </div>
        )},
        { header: "Inventory", accessor: (item: any) => (
            <div className="flex items-center gap-2">
                <span className={classNames(
                    "font-black tabular-nums",
                    item.quantity <= 10 ? "text-rose-500" : "text-emerald-500"
                )}>
                    {item.quantity}
                </span>
                <span className="text-[10px] uppercase text-gray-400">pcs</span>
            </div>
        ), sortable: true },
        { header: "Status", accessor: (item: any) => (
            item.quantity > 0 
                ? <Badge variant="success">In Stock</Badge> 
                : <Badge variant="error">Out of Stock</Badge>
        )},
    ];

    // Helper function to check permissions
    const hasPermission = (permission: string) => {
        if (isAdmin) return true;
        return permissions && permissions.includes(permission);
    };

    const handleSeriasCreated = (newSerias: any) => {
        console.log("New series added:", newSerias);
        // Reload props to get updated seriasList
        router.reload({ only: ['seriasList'] });
        refetch();
    };

    const handleBulkExport = async (ids: (string | number)[], format: 'csv' | 'xlsx') => {
        try {
            const response = await axios.post('/api/v1/products/bulk-export', { ids, format }, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `products_export_${new Date().toISOString()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed. Please try again.");
        }
    };

    const handleExportFiltered = async () => {
        try {
            const params = { ...currentFilters, search: searchQuery, format: 'xlsx' };
            const response = await axios.get('/api/v1/products/export', { 
                params,
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `inventory_export_${new Date().toISOString()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed. Please try again.");
        }
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
            <div className="flex-1 p-6 space-y-4 animate-premium-in">
                <Breadcrumbs items={[{ label: 'Inventory', href: route('products.index') }]} />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Inventory</h2>
                        <p className="text-sm text-gray-500">Manage your product stock and availability.</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {canAddStock && (
                            <Button variant="outline" onClick={() => setIsStockModalOpen(true)} className="rounded-2xl gap-2 border-2">
                                <RefreshCw className="w-4 h-4" /> Add Stock
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleExportFiltered} className="rounded-2xl gap-2 border-2 text-gray-600">
                            <Download className="w-4 h-4" /> Export
                        </Button>
                        {canAddSeries && (
                            <Button variant="ghost" onClick={() => setIsSeriasModalOpen(true)} className="rounded-2xl gap-2 text-gray-500 hover:text-indigo-600">
                                <Plus className="w-4 h-4" /> Add Vehicle Type
                            </Button>
                        )}
                        {canAddProduct && (
                            <Button onClick={() => setIsProductModalOpen(true)} className="rounded-2xl gap-2 shadow-lg shadow-indigo-500/20" data-shortcut="new">
                                <Plus className="w-4 h-4" /> New Product
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="border-none shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5">
                    <div className="p-4 space-y-6">
                        <AdvancedFilter 
                            options={filterOptions}
                            onSearch={(q) => setSearchQuery(q)}
                            onFilter={(f) => setCurrentFilters(f)}
                            isLoading={isLoading}
                            moduleId="inventory_index"
                        />

                        {isLoading ? (
                            <TableSkeleton rows={8} cols={6} />
                        ) : productsData?.data?.length > 0 ? (
                            <DataTable 
                                data={productsData.data}
                                columns={columns}
                                enableSelection={isAdmin}
                                bulkActions={(ids) => (
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setIsBulkEditModalOpen(true)}
                                            className="rounded-xl gap-2 border-2"
                                        >
                                            <PencilIcon className="w-4 h-4" /> Edit {ids.length}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleBulkExport(ids, 'xlsx')}
                                            className="rounded-xl gap-2 border-2 text-green-600 hover:bg-green-50 hover:border-green-200"
                                        >
                                            <FileSpreadsheet className="w-4 h-4" /> Excel
                                        </Button>
                                        <ConfirmButton
                                            url={`/api/v1/products/bulk-delete`}
                                            label={`Delete ${ids.length} items`}
                                            className="!p-0 bg-transparent"
                                            onSuccess={() => refetch()}
                                        >
                                            <Button variant="danger" size="sm" className="rounded-xl gap-2">
                                                <Trash2 className="w-4 h-4" /> Delete Selected
                                            </Button>
                                        </ConfirmButton>
                                    </div>
                                )}
                                actions={(item) => (
                                    <div className="flex gap-2">
                                        {hasPermission('edit_products') && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => {
                                                    setSelectedProduct(item);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="hover:bg-indigo-50 text-indigo-600 rounded-xl"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {hasPermission('delete_products') && (
                                            <ConfirmButton
                                                url={`/api/v1/products/${item.id}`}
                                                label="Delete"
                                                className="!p-0 bg-transparent"
                                            >
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="hover:bg-rose-50 text-rose-600 rounded-xl"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </ConfirmButton>
                                        )}
                                    </div>
                                )}
                                onSelectionChange={setSelectedIds}
                            />
                        ) : (
                            <div className="py-12">
                                <EmptyState 
                                    title="No Products Found" 
                                    description="Start by adding your first product to the inventory."
                                    icon={Box}
                                    action={canAddProduct ? {
                                        label: "Add Product",
                                        onClick: () => setIsProductModalOpen(true)
                                    } : undefined}
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Modals */}
                <CreateProductModal
                    isOpen={isProductModalOpen}
                    onClose={() => setIsProductModalOpen(false)}
                    onCreated={() => refetch()}
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
                    onStockAdded={() => refetch()}
                    productsList={productsData?.data || []}
                />
                <EditProductModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdated={() => refetch()}
                    product={selectedProduct}
                    seriasList={seriasList}
                />
                <BulkEditModal
                    isOpen={isBulkEditModalOpen}
                    onClose={() => setIsBulkEditModalOpen(false)}
                    onSuccess={() => refetch()}
                    selectedIds={selectedIds}
                    seriasList={seriasList}
                />
            </div>
        </Authenticated>
    );
}
