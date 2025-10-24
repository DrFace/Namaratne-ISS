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
            'productCode'        => 'nullable|string|max:255|unique:products,productCode',
            'productImage'       => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:10240', // ✅ fixed
            'productDescription' => 'nullable|string',
            'buyingPrice'        => 'required|numeric',
            'sellingPrice'       => 'required|numeric',
            'quantity'           => 'required|integer',
            'unit'               => 'nullable|string',
            'brand'              => 'nullable|string',
            'tax'                => 'nullable|numeric',
            'discount'           => 'nullable|numeric',
            'seriasId'           => 'nullable|integer',
            'lowStock'           => 'nullable|integer',
            'supplier_id'        => 'nullable|integer',
            'expiryDate'         => 'nullable|date',
            'purchaseDate'       => 'required|date',
        ]);

        $validated['createdBy'] = auth()->id();

        if ($request->hasFile('productImage')) {
            $file     = $request->file('productImage');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('assets'), $filename);

            $validated['productImage'] = 'assets/' . $filename;
        }

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    public function seriasStore(Request $request)
    {
        $validated = $request->validate([
            'seriasNo' => 'required|string|max:255',
        ]);

        $serias = SeriasNumber::create($validated);

        return response()->json($serias, 201);
    }
}
