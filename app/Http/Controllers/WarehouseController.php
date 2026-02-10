<?php

namespace App\Http\Controllers;

use App\Services\WarehouseService;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function __construct(
        protected WarehouseService $warehouseService
    ) {}

    /**
     * Display a listing of the warehouses.
     */
    public function index(Request $request)
    {
        $warehouses = Warehouse::all();
        
        if ($request->wantsJson()) {
            return response()->json($warehouses);
        }

        return Inertia::render('Warehouses/Index', [
            'warehouses' => $warehouses,
            'permissions' => auth()->user()->getPermissions(),
            'isAdmin' => auth()->user()->isAdmin(),
        ]);
    }

    /**
     * Store a newly created warehouse in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:warehouses,name',
            'location' => 'nullable|string',
            'contact_number' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
            'is_primary' => 'nullable|boolean',
        ]);

        $warehouse = $this->warehouseService->createWarehouse($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Warehouse created successfully',
                'warehouse' => $warehouse
            ], 201);
        }

        return redirect()->back()->with('success', 'Warehouse created successfully');
    }

    /**
     * Display the specified warehouse.
     */
    public function show(Request $request, int $id)
    {
        $warehouse = Warehouse::with('inventory.product')->findOrFail($id);
        
        if ($request->wantsJson()) {
            return response()->json($warehouse);
        }

        return Inertia::render('Warehouses/Show', [
            'warehouse' => $warehouse,
        ]);
    }

    /**
     * Update the specified warehouse in storage.
     */
    public function update(Request $request, int $id)
    {
        $warehouse = Warehouse::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:warehouses,name,' . $id,
            'location' => 'nullable|string',
            'contact_number' => 'nullable|string',
            'status' => 'sometimes|required|in:active,inactive',
            'is_primary' => 'sometimes|required|boolean',
        ]);

        $warehouse->update($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Warehouse updated successfully',
                'warehouse' => $warehouse
            ]);
        }

        return redirect()->back()->with('success', 'Warehouse updated successfully');
    }

    /**
     * Remove the specified warehouse from storage.
     */
    public function destroy(int $id)
    {
        $warehouse = Warehouse::findOrFail($id);
        
        // Prevent deletion if it has inventory
        if ($warehouse->inventory()->where('quantity', '>', 0)->exists()) {
            return response()->json([
                'message' => 'Cannot delete warehouse with existing stock. Please transfer stock out first.'
            ], 422);
        }

        $warehouse->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Warehouse deleted successfully'
            ]);
        }

        return redirect()->back()->with('success', 'Warehouse deleted successfully');
    }

    /**
     * Get stock levels for a specific product across all warehouses.
     */
    public function productStock(int $productId)
    {
        $levels = $this->warehouseService->getProductStockLevels($productId);
        return response()->json($levels);
    }
}
