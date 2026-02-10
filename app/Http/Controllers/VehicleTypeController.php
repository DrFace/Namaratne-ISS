<?php

namespace App\Http\Controllers;

use App\Models\SeriasNumber;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleTypeController extends Controller
{
    /**
     * Display a listing of vehicle types.
     */
    public function index()
    {
        $vehicleTypes = SeriasNumber::latest()->get();

        return Inertia::render('Inventory/VehicleTypes', [
            'vehicleTypes' => $vehicleTypes,
        ]);
    }

    /**
     * Store a newly created vehicle type in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'seriasNo' => 'required|string|unique:serias_numbers,seriasNo|max:255',
        ]);

        $vehicleType = SeriasNumber::create($validated);

        if ($request->wantsJson()) {
            return response()->json($vehicleType, 201);
        }

        return redirect()->back()->with('success', 'Vehicle Type created successfully.');
    }

    /**
     * Update the specified vehicle type in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'seriasNo' => 'required|string|unique:serias_numbers,seriasNo,' . $id . '|max:255',
        ]);

        $vehicleType = SeriasNumber::findOrFail($id);
        $vehicleType->update($validated);

        if ($request->wantsJson()) {
            return response()->json($vehicleType);
        }

        return redirect()->back()->with('success', 'Vehicle Type updated successfully.');
    }

    /**
     * Remove the specified vehicle type from storage.
     */
    public function destroy($id)
    {
        $vehicleType = SeriasNumber::findOrFail($id);
        
        // Check if any products are using this vehicle type
        $productCount = \App\Models\Product::where('seriasId', $id)->count();
        
        if ($productCount > 0) {
            if (request()->wantsJson()) {
                return response()->json([
                    'message' => "Cannot delete vehicle type that is assigned to {$productCount} products."
                ], 422);
            }
            return redirect()->back()->withErrors(['error' => "Cannot delete vehicle type that is assigned to {$productCount} products."]);
        }

        $vehicleType->delete();

        if (request()->wantsJson()) {
            return response()->json(['message' => 'Vehicle Type deleted successfully.']);
        }

        return redirect()->back()->with('success', 'Vehicle Type deleted successfully.');
    }
}
