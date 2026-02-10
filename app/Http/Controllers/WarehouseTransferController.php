<?php

namespace App\Http\Controllers;

use App\Services\WarehouseService;
use App\Models\WarehouseTransfer;
use Illuminate\Http\Request;

class WarehouseTransferController extends Controller
{
    public function __construct(
        protected WarehouseService $warehouseService
    ) {}

    /**
     * Display a listing of stock transfers.
     */
    public function index()
    {
        return response()->json(WarehouseTransfer::with(['fromWarehouse', 'toWarehouse', 'product', 'creator'])->latest()->paginate(20));
    }

    /**
     * Store a newly created transfer in storage (Initiates transfer).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string',
        ]);

        try {
            $transfer = $this->warehouseService->initiateTransfer($validated);
            return response()->json([
                'message' => 'Transfer initiated successfully',
                'transfer' => $transfer->load(['fromWarehouse', 'toWarehouse', 'product'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Update status to complete (Receives stock).
     */
    public function complete(int $id)
    {
        try {
            $transfer = $this->warehouseService->completeTransfer($id);
            return response()->json([
                'message' => 'Transfer completed and stock updated',
                'transfer' => $transfer
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Display the specified transfer.
     */
    public function show(int $id)
    {
        $transfer = WarehouseTransfer::with(['fromWarehouse', 'toWarehouse', 'product', 'creator'])->findOrFail($id);
        return response()->json($transfer);
    }
}
