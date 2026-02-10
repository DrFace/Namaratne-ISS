<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    /**
     * Display a listing of units.
     */
    public function index()
    {
        return response()->json(Unit::with('baseUnit')->get());
    }

    /**
     * Store a newly created unit.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:units,name',
            'short_name' => 'required|string',
            'base_unit_id' => 'nullable|exists:units,id',
            'operator' => 'nullable|required_with:base_unit_id|in:multiply,divide',
            'operator_value' => 'nullable|required_with:base_unit_id|numeric|min:0.0001',
        ]);

        $unit = Unit::create($validated);

        return response()->json([
            'message' => 'Unit created successfully',
            'unit' => $unit
        ], 201);
    }

    /**
     * Display the specified unit.
     */
    public function show(Unit $unit)
    {
        return response()->json($unit->load('subUnits'));
    }

    /**
     * Update the specified unit.
     */
    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|unique:units,name,' . $unit->id,
            'short_name' => 'sometimes|required|string',
            'base_unit_id' => 'nullable|exists:units,id',
            'operator' => 'nullable|required_with:base_unit_id|in:multiply,divide',
            'operator_value' => 'nullable|required_with:base_unit_id|numeric|min:0.0001',
        ]);

        $unit->update($validated);

        return response()->json([
            'message' => 'Unit updated successfully',
            'unit' => $unit
        ]);
    }

    /**
     * Remove the specified unit.
     */
    public function destroy(Unit $unit)
    {
        // Check if it's a base unit for others
        if ($unit->subUnits()->exists()) {
            return response()->json([
                'message' => 'Cannot delete unit that is a base unit for other units.'
            ], 422);
        }

        $unit->delete();

        return response()->json([
            'message' => 'Unit deleted successfully'
        ]);
    }
}
