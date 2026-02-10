<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function __construct(
        protected SupplierService $supplierService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $suppliers = $this->supplierService->getAllSuppliers();
        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplierName' => 'required|string|max:255',
            'supplierAddress' => 'nullable|string',
            'supplierPhone' => 'nullable|string',
            'supplierEmail' => 'nullable|email',
            'companyName' => 'nullable|string',
            'availibility' => 'nullable|in:active,inactive',
            'status' => 'nullable|string',
        ]);

        $this->supplierService->createSupplier($validated);

        return redirect()->back()->with('success', 'Supplier created successfully');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'supplierName' => 'sometimes|required|string|max:255',
            'supplierAddress' => 'nullable|string',
            'supplierPhone' => 'nullable|string',
            'supplierEmail' => 'nullable|email',
            'companyName' => 'nullable|string',
            'availibility' => 'nullable|in:active,inactive',
            'status' => 'nullable|string',
        ]);

        $this->supplierService->updateSupplier((int) $id, $validated);

        return redirect()->back()->with('success', 'Supplier updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $this->supplierService->deleteSupplier((int) $id);
        return redirect()->back()->with('success', 'Supplier deleted successfully');
    }
}
