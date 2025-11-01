<?php
namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\SeriasNumber;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        // Paginate only required columns
        $products = Product::select([
            'id',
            'productName',
            'seriasId',
            'buyingPrice',
            'sellingPrice',
            'quantity',
            'purchaseDate',
            'status',
        ])->paginate(10)->toArray();

        // Fetch series list
        $seriasList = SeriasNumber::select(['id', 'seriasNo'])->get()->toArray();

        return Inertia::render('Inventory/Index', [
            'products'   => $products,
            'seriasList' => $seriasList,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'productName'        => 'nullable|string|max:255',
            'productCode'        => 'required|string|max:255',
            'productImage'       => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
            'productDescription' => 'nullable|string',
            'buyingPrice'        => 'required|numeric',
            'sellingPrice'       => 'required|numeric',
            'quantity'           => 'required|integer',
            'unit'               => 'nullable|string',
            'brand'              => 'nullable|string',
            'tax'                => 'nullable|numeric',
            'profitMargin'       => 'nullable|numeric',
            'seriasId'           => 'nullable|integer',
            'lowStock'           => 'nullable|integer',
            'supplier_id'        => 'nullable|integer',
            'batchNumber'        => 'nullable|string',
            'expiryDate'         => 'nullable|date',
            'purchaseDate'       => 'required|date',
        ]);

        $validated['createdBy'] = auth()->id();

        // ✅ handle image upload
        if ($request->hasFile('productImage')) {
            $file     = $request->file('productImage');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('assets'), $filename);
            $validated['productImage'] = 'assets/' . $filename;
        }

        // ✅ check if product with same code & batch exists
        $existingProduct = Product::where('productCode', $validated['productCode'])
            ->where('batchNumber', $validated['batchNumber'])
            ->first();

        if ($existingProduct) {
            // ✅ Add quantity to existing one
            $existingProduct->quantity += $validated['quantity'];

            // ✅ Update other fields if needed (optional)
            $existingProduct->fill([
                'buyingPrice'        => $validated['buyingPrice'],
                'sellingPrice'       => $validated['sellingPrice'],
                'brand'              => $validated['brand'] ?? $existingProduct->brand,
                'tax'                => $validated['tax'] ?? $existingProduct->tax,
                'profitMargin'       => $validated['profitMargin'] ?? $existingProduct->profitMargin,
                'unit'               => $validated['unit'] ?? $existingProduct->unit,
                'lowStock'           => $validated['lowStock'] ?? $existingProduct->lowStock,
                'productDescription' => $validated['productDescription'] ?? $existingProduct->productDescription,
                'expiryDate'         => $validated['expiryDate'] ?? $existingProduct->expiryDate,
                'purchaseDate'       => $validated['purchaseDate'] ?? $existingProduct->purchaseDate,
            ]);

            if (isset($validated['productImage'])) {
                $existingProduct->productImage = $validated['productImage'];
            }

            $existingProduct->save();

            return response()->json([
                'message' => 'Product quantity updated successfully',
                'product' => $existingProduct,
            ], 200);
        } else {
            // 🆕 Create new record for a different batch
            $product = Product::create($validated);

            return response()->json([
                'message' => 'New product (different batch) created successfully',
                'product' => $product,
            ], 201);
        }
    }

    public function seriasStore(Request $request)
    {
        $validated = $request->validate([
            'seriasNo' => 'required|string|max:255',
        ]);

        $serias = SeriasNumber::create($validated);

        return response()->json($serias, 201);
    }

        public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json(['product' => $product], 200);
    }

    // 🔹 Update existing product
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validated = $request->validate([
            'productName'        => 'nullable|string|max:255',
            'productCode'        => 'required|string|max:255',
            'productImage'       => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
            'productDescription' => 'nullable|string',
            'buyingPrice'        => 'required|numeric',
            'sellingPrice'       => 'required|numeric',
            'quantity'           => 'required|integer',
            'unit'               => 'nullable|string',
            'brand'              => 'nullable|string',
            'tax'                => 'nullable|numeric',
            'profitMargin'       => 'nullable|numeric',
            'seriasId'           => 'nullable|integer',
            'lowStock'           => 'nullable|integer',
            'supplier_id'        => 'nullable|integer',
            'batchNumber'        => 'nullable|string',
            'expiryDate'         => 'nullable|date',
            'purchaseDate'       => 'required|date',
        ]);

        // Handle image upload
        if ($request->hasFile('productImage')) {
            $file     = $request->file('productImage');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('assets'), $filename);
            $validated['productImage'] = 'assets/' . $filename;
        }

        // Update fields
        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ], 200);
    }
}
