<?php

namespace App\Http\Controllers;

use App\Services\ReturnService;
use App\Models\Sales;
use App\Models\ReturnModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReturnController extends Controller
{
    public function __construct(
        protected ReturnService $returnService
    ) {}

    /**
     * Display a listing of returns.
     */
    public function index(Request $request)
    {
        $query = ReturnModel::with(['sale.customer', 'createdBy']);

        if ($request->search) {
            $query->where('return_number', 'like', "%{$request->search}%")
                  ->orWhereHas('sale', function($q) use ($request) {
                      $q->where('billNumber', 'like', "%{$request->search}%");
                  });
        }

        $returns = $query->latest()->paginate(10);

        return Inertia::render('Returns/Index', [
            'returns' => $returns,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new return.
     */
    public function create($saleId)
    {
        $sale = Sales::with(['customer', 'salesDetails.product'])->findOrFail($saleId);
        
        // Calculate already returned quantities
        foreach ($sale->salesDetails as $detail) {
            $detail->returned_quantity = \App\Models\ReturnItem::whereHas('return', function($q) use ($saleId) {
                $q->where('sale_id', $saleId);
            })->where('product_id', $detail->productId)->sum('quantity');
        }

        return Inertia::render('Returns/Create', [
            'sale' => $sale
        ]);
    }

    /**
     * Store a newly created return in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'total_amount' => 'required|numeric|min:0',
            'refund_amount' => 'required|numeric|min:0',
            'reason' => 'nullable|string',
            'status' => 'required|in:pending,received,completed,rejected',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.refund_amount' => 'required|numeric|min:0',
            'items.*.restock' => 'required|boolean',
        ]);

        try {
            $return = $this->returnService->processReturn($validated);

            return redirect()->route('returns.show', $return->id)
                ->with('success', 'Return processed successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified return.
     */
    public function show($id)
    {
        $return = ReturnModel::with(['sale.customer', 'items.product', 'createdBy'])->findOrFail($id);

        return Inertia::render('Returns/Show', [
            'return' => $return
        ]);
    }

    /**
     * API: Process return.
     */
    public function apiStore(Request $request)
    {
        // Validation same as store but return JSON
        try {
            $return = $this->returnService->processReturn($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Return processed',
                'return' => $return
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
