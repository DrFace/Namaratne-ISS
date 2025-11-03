import { useState } from "react";
import { usePage } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import MasterTable, { TableBody, TableTd } from "@/Components/elements/tables/masterTable";
import CreateProductModal from "./CreateProductModal";
import CreateSeriasModal from "./CreateSeriasModal";
import { PencilIcon } from "@heroicons/react/20/solid";
import ConfirmButton from "@/Components/elements/buttons/ConfirmButton";
import { PrimaryLink } from "@/Components/elements/buttons/PrimaryButton";

export default function ProductsIndexPage() {
    const { products: initialProducts, seriasList } = usePage().props as any;

    // State: products object (paginated)
    const [products, setProducts] = useState(initialProducts);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSeriasModalOpen, setIsSeriasModalOpen] = useState(false);

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

    const tableColumns = [
        { label: "", sortField: "", sortable: false },
        { label: "ID", sortField: "id", sortable: true },
        { label: "Product name", sortField: "productName", sortable: true },
        { label: "Series", sortField: "seriasNo", sortable: true },
        { label: "Buying Price", sortField: "buyingPrice", sortable: true },
        { label: "Selling Price", sortField: "sellingPrice", sortable: true },
        { label: "Quantity", sortField: "quantity", sortable: true },
        { label: "Purchase Date", sortField: "purchaseDate", sortable: true },
        { label: "Availability", sortField: "availability", sortable: true },
    ];

    const filters = {};
    const createLink = undefined;

    return (
        <Authenticated bRoutes={undefined}>
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Products</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsProductModalOpen(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                            Add Product
                        </button>
                        <button
                            onClick={() => setIsSeriasModalOpen(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                            Add Series
                        </button>
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
                            buttons={
                                <>
                                    <PrimaryLink
                                        className="!py-2"
                                        href={`/products/${product.id}/edit`}
                                    >
                                        <PencilIcon className="w-3 h-3 mr-2" /> Edit
                                    </PrimaryLink>
                                    <ConfirmButton
                                        className="!py-2"
                                        url={`/products/${product.id}`}
                                        label="Delete"
                                    />
                                </>
                            }
                        >
                            <TableTd>{product.id}</TableTd>
                            <TableTd>{product.productName}</TableTd>
                            <TableTd>
                                {seriasList.find((s: any) => s.id === product.seriasId)?.seriasNo ?? "-"}
                            </TableTd>
                            <TableTd>LKR {product.buyingPrice}</TableTd>
                            <TableTd>LKR {product.sellingPrice}</TableTd>
                            <TableTd>{product.quantity}</TableTd>
                            <TableTd>{product.purchaseDate ?? "-"}</TableTd>
                            <TableTd>
                                <div className={`font-semibold ${product.quantity > 0 ? "text-green-500" : "text-red-500"}`}>
                                    {product.quantity > 0 ? "In-stock" : "Out of stock"}
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
            </div>
        </Authenticated>
    );
}
