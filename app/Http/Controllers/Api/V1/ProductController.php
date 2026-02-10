<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use App\Http\Resources\V1\ProductResource;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    /**
     * Get all products with pagination
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'availability']);
        $perPage = $request->input('per_page', 50);

        $products = $this->productService->getPaginatedProducts($filters, $perPage);

        return ProductResource::collection($products);
    }

    /**
     * Create a new product
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'productName'        => 'required|string|max:255',
            'productCode'        => 'required|string|max:255|unique:products',
            'productDescription' => 'nullable|string',
            'unit'               => 'required|string',
            'brand'              => 'nullable|string',
            'seriasId'           => 'nullable|integer',
            'lowStock'           => 'required|integer',
        ]);

        try {
            $validated['createdBy'] = auth()->id();
            $product = $this->productService->createProduct($validated);

            return response()->json([
                'message' => 'Product created successfully',
                'data' => new ProductResource($product)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single product
     */
    public function show($id)
    {
        $product = $this->productService->getProductById($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        return new ProductResource($product);
    }

    /**
     * Update product
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'productName'        => 'sometimes|string|max:255',
            'productCode'        => 'sometimes|string|max:255',
            'productDescription' => 'nullable|string',
            'unit'               => 'sometimes|string',
            'brand'              => 'nullable|string',
            'lowStock'           => 'sometimes|integer',
        ]);

        try {
            $product = $this->productService->updateProduct($id, $validated);

            return response()->json([
                'message' => 'Product updated successfully',
                'data' => new ProductResource($product)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete product
     */
    public function destroy($id)
    {
        try {
            $this->productService->deleteProduct($id);

            return response()->json([
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock products
     */
    public function lowStock($threshold = null)
    {
        $products = $this->productService->getLowStockProducts($threshold);

        return ProductResource::collection($products)->additional([
            'count' => $products->count()
        ]);
    }

    /**
     * Get expiring products
     */
    public function expiring($days = 30)
    {
        $products = $this->productService->getExpiringProducts($days);

        return ProductResource::collection($products)->additional([
            'count' => $products->count()
        ]);
    }

    /**
     * Bulk delete products
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:products,id'
        ]);

        try {
            $this->productService->bulkDelete($validated['ids']);

            return response()->json([
                'message' => 'Products deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update products
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:products,id',
            'data' => 'required|array|min:1'
        ]);

        try {
            $this->productService->bulkUpdate($validated['ids'], $validated['data']);

            return response()->json([
                'message' => 'Products updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk export products
     */
    public function bulkExport(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:products,id',
            'format' => 'nullable|in:xlsx,csv'
        ]);

        return $this->productService->exportProducts(
            $validated['ids'], 
            $validated['format'] ?? 'xlsx'
        );
    }

    /**
     * Export filtered products
     */
    public function export(Request $request)
    {
        $filters = $request->only(['search', 'status', 'availability']);
        $format = $request->input('format', 'xlsx');

        return $this->productService->exportFilteredProducts($filters, $format);
    }
}
