<?php
namespace App\Http\Controllers;

use App\Services\ProductService;
use App\Services\StockService;
use App\Models\SeriasNumber;
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

        $validated = $request->validate([
            'productCode'    => 'required|string',
            'quantity'       => 'required|integer|min:1',
            'buyingPrice'    => 'nullable|numeric',
            'sellingPrice'   => 'nullable|numeric',
            'batchNumber'    => 'nullable|string',
            'expiryDate'     => 'nullable|date',
            'purchaseDate'   => 'nullable|date',
            'supplierId'     => 'nullable|integer',
        ]);

        $validated['createdBy'] = auth()->id();

        try {
            $product = $this->stockService->addStock($validated);

            return response()->json([
                'message' => 'Stock added successfully',
                'stock'   => $product,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error adding stock: ' . $e->getMessage(),
            ], 500);
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
