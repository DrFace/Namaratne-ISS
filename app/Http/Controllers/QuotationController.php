<?php

namespace App\Http\Controllers;

use App\Services\QuotationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuotationController extends Controller
{
    public function __construct(
        protected QuotationService $quotationService
    ) {}

    /**
     * Display quotations list
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'customer_id', 'date_from', 'date_to']);
        $quotations = $this->quotationService->getPaginatedQuotations($filters, $request->input('per_page', 50));

        if ($request->wantsJson()) {
            return response()->json($quotations);
        }

        return Inertia::render('Quotations/Index', [
            'quotations' => $quotations,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new quotation
     */
    public function create()
    {
        return Inertia::render('Quotations/Create', [
            'customers' => \App\Models\Customer::select(['id', 'name'])->get(),
            'products' => \App\Models\Product::select(['id', 'productName', 'productCode', 'unitPrice'])->where('quantity', '>', 0)->get(),
        ]);
    }

    /**
     * Create a new quotation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount_value' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'valid_until' => 'nullable|date|after:today',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:draft,sent',
        ]);

        try {
            $validated['created_by'] = auth()->id();
            $quotation = $this->quotationService->createQuotation($validated);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Quotation created successfully',
                    'quotation' => $quotation,
                ], 201);
            }

            return redirect()->route('quotations.show', $quotation->id)->with('success', 'Quotation created successfully');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Error creating quotation: ' . $e->getMessage(),
                ], 500);
            }
            return redirect()->back()->with('error', 'Error creating quotation: ' . $e->getMessage());
        }
    }

    /**
     * Display a single quotation
     */
    public function show(Request $request, $id)
    {
        $quotation = $this->quotationService->getQuotationById($id);

        if (!$quotation) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Quotation not found'], 404);
            }
            return redirect()->route('quotations.index')->with('error', 'Quotation not found');
        }

        if ($request->wantsJson()) {
            return response()->json($quotation);
        }

        return Inertia::render('Quotations/Show', [
            'quotation' => $quotation,
        ]);
    }

    /**
     * Show the form for editing a quotation
     */
    public function edit($id)
    {
        $quotation = $this->quotationService->getQuotationById($id);
        
        if (!$quotation || !in_array($quotation->status, ['draft', 'sent'])) {
             return redirect()->route('quotations.show', $id)->with('error', 'Only draft or sent quotations can be edited.');
        }

        return Inertia::render('Quotations/Create', [
            'quotation' => $quotation,
            'customers' => \App\Models\Customer::select(['id', 'name'])->get(),
            'products' => \App\Models\Product::select(['id', 'productName', 'productCode', 'unitPrice'])->where('quantity', '>', 0)->get(),
        ]);
    }

    /**
     * Update a quotation
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'customer_id' => 'sometimes|exists:customers,id',
            'items' => 'sometimes|array|min:1',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'discount_value' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'valid_until' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        try {
            $quotation = $this->quotationService->updateQuotation($id, $validated);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Quotation updated successfully',
                    'quotation' => $quotation,
                ]);
            }

            return redirect()->route('quotations.show', $id)->with('success', 'Quotation updated successfully');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Error updating quotation: ' . $e->getMessage(),
                ], 500);
            }
            return redirect()->back()->with('error', 'Error updating quotation: ' . $e->getMessage());
        }
    }

    /**
     * Delete a quotation
     */
    public function destroy($id)
    {
        try {
            $this->quotationService->deleteQuotation($id);

            return response()->json([
                'message' => 'Quotation deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting quotation: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Convert quotation to invoice
     */
    public function convertToInvoice(Request $request, $id)
    {
        try {
            $sale = $this->quotationService->convertToInvoice($id);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Quotation converted to invoice successfully',
                    'sale' => $sale,
                    'invoice_id' => $sale->id,
                ]);
            }

            return redirect()->route('billing.index')->with('success', 'Quotation converted to invoice successfully. Invoice ID: ' . $sale->id);
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Error converting quotation: ' . $e->getMessage(),
                ], 500);
            }
            return redirect()->back()->with('error', 'Error converting quotation: ' . $e->getMessage());
        }
    }

    /**
     * Update quotation status
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,approved,rejected,expired',
        ]);

        try {
            $quotation = $this->quotationService->updateStatus($id, $validated['status']);

            return response()->json([
                'message' => 'Quotation status updated successfully',
                'quotation' => $quotation,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating status: ' . $e->getMessage(),
            ], 500);
        }
    }
}
