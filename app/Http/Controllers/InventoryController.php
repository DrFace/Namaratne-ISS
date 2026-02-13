<?php
namespace App\Http\Controllers;

use App\Services\ProductService;
use App\Services\StockService;
use App\Models\SeriasNumber;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class InventoryController extends Controller
{
    public function __construct(
        protected ProductService $productService,
        protected StockService $stockService
    ) {}

    public function index()
    {
        $products = $this->productService->getPaginatedProducts([], 10);
        $seriasList = SeriasNumber::select(['id', 'seriasNo'])->get()->toArray();

        $user = auth()->user();
        $permissions = $user->getPermissions();
        $isAdmin = $user->isAdmin();

        return Inertia::render('Inventory/Index', [
            'products'    => $products,
            'seriasList'  => $seriasList,
            'permissions' => $permissions,
            'isAdmin'     => $isAdmin,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('add_products');

        $validated = $request->validate([
            'productName'        => 'required|string|max:255',
            'productCode'        => 'required|string|max:255|unique:products',
            'productImage'       => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
            'productDescription' => 'nullable|string',
            'unit'               => 'required|string',
            'brand'              => 'nullable|string',
            'seriasId'           => 'nullable|integer',
            'lowStock'           => 'required|integer',
            'vehicle_type'       => 'nullable|string|max:255',
        ]);

        $validated['createdBy'] = auth()->id();

        try {
            $product = $this->productService->createProduct($validated);

            return response()->json([
                'message' => 'Product created successfully. Add stock to set pricing.',
                'product' => $product,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating product: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function addStock(Request $request)
    {
        Gate::authorize('restock_products');

        $mode = $request->input('mode', 'new');

        if ($mode === 'existing') {
            // Existing batch mode - only need batchId and quantity
            $validated = $request->validate([
                'batchId'  => 'required|integer|exists:products,id',
                'quantity' => 'required|integer|min:1',
            ]);

            try {
                $batch = Product::findOrFail($validated['batchId']);
                $batch->increment('quantity', $validated['quantity']);

                return response()->json([
                    'message' => 'Stock added to existing batch successfully',
                    'stock'   => $batch->fresh(),
                ], 200);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Error adding stock: ' . $e->getMessage(),
                ], 500);
            }
        } else {
            // New batch mode - need full product details
            $validated = $request->validate([
                'productId'      => 'required|integer|exists:products,id',
                'quantity'       => 'required|integer|min:1',
                'buyingPrice'    => 'required|numeric|min:0',
                'tax'            => 'required|numeric|min:0',
                'profitMargin'   => 'required|numeric|min:0',
                'sellingPrice'   => 'required|numeric|min:0',
                'batchNumber'    => 'required|string',
                'purchaseDate'   => 'required|date',
                'expiryDate'     => 'nullable|date',
                'supplierId'     => 'nullable|integer',
            ]);

            try {
                // Get the base product
                $baseProduct = Product::findOrFail($validated['productId']);

                // Create new batch as a new product record
                $newBatch = Product::create([
                    'productName'        => $baseProduct->productName,
                    'productCode'        => $baseProduct->productCode,
                    'productDescription' => $baseProduct->productDescription,
                    'productImage'       => $baseProduct->productImage,
                    'buyingPrice'        => $validated['buyingPrice'],
                    'sellingPrice'       => $validated['sellingPrice'],
                    'tax'                => $validated['tax'],
                    'profitMargin'       => $validated['profitMargin'],
                    'quantity'           => $validated['quantity'],
                    'unit'               => $baseProduct->unit,
                    'brand'              => $baseProduct->brand,
                    'seriasId'           => $baseProduct->seriasId,
                    'supplierId'         => $validated['supplierId'] ?? $baseProduct->supplierId,
                    'createdBy'          => auth()->id(),
                    'lowStock'           => $baseProduct->lowStock,
                    'batchNumber'        => $validated['batchNumber'],
                    'expiryDate'         => $validated['expiryDate'] ?? null,
                    'purchaseDate'       => $validated['purchaseDate'],
                    'status'             => 'active',
                    'availability'       => 'instock',
                    'vehicle_type'       => $baseProduct->vehicle_type,
                ]);

                return response()->json([
                    'message' => 'New batch created successfully',
                    'stock'   => $newBatch,
                ], 200);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Error creating batch: ' . $e->getMessage(),
                ], 500);
            }
        }
    }

    public function seriasStore(Request $request)
    {
        Gate::authorize('add_series');
        $validated = $request->validate([
            'seriasNo' => 'required|string|max:255|unique:serias_numbers',
            'status'   => 'nullable|string|in:active,inactive,pending,approved,draft',
        ]);

        try {
            $serias = SeriasNumber::create($validated);
            return response()->json($serias, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error saving vehicle type: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $product = $this->productService->getProductById($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json(['product' => $product], 200);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'productCode'        => 'nullable|string|max:255',
            'productDescription' => 'nullable|string|max:1000',
            'unit'               => 'nullable|string|max:50',
            'brand'              => 'nullable|string|max:255',
            'seriasId'           => 'nullable|integer',
            'lowStock'           => 'nullable|integer|min:0',
            'productName'        => 'nullable|string|max:255',
            'productImage'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'vehicle_type'       => 'nullable|string|max:255',
        ]);

        try {
            $product = $this->productService->updateProduct($id, $validated);

            return response()->json([
                'message' => 'Product updated successfully',
                'product' => $product,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating product: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        Gate::authorize('delete_products');

        try {
            $this->productService->deleteProduct($id);

            return response()->json([
                'message' => 'Product deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting product: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getBatches($productId)
    {
        try {
            $batches = $this->productService->getProductsByBatch($productId);

            return response()->json([
                'batches' => $batches,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching batches: ' . $e->getMessage(),
            ], 404);
        }
    }
}
