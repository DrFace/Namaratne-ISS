<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\BillingService;
use App\Http\Resources\V1\SaleResource;
use Illuminate\Http\Request;

class SalesController extends Controller
{
    public function __construct(
        protected BillingService $billingService
    ) {}

    /**
     * Get all sales with pagination
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'customerId', 'dateFrom', 'dateTo']);
        $perPage = $request->input('per_page', 50);

        $sales = $this->billingService->getPaginatedSales($filters, $perPage);

        return SaleResource::collection($sales);
    }

    /**
     * Create a new sale
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customerId'     => 'required|integer|exists:customers,id',
            'products'       => 'required|array',
            'products.*.id'  => 'required|integer|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.price'    => 'required|numeric|min:0',
            'discount_value' => 'nullable|numeric|min:0',
            'paidAmount'     => 'nullable|numeric|min:0',
            'creditAmount'   => 'nullable|numeric|min:0',
            'cardAmount'     => 'nullable|numeric|min:0',
            'cashAmount'     => 'nullable|numeric|min:0',
            'paymentMethod'  => 'nullable|string|in:cash,credit,card,mixed',
        ]);

        try {
            $validated['createdBy'] = auth()->id();
            $sale = $this->billingService->createSale($validated);

            return response()->json([
                'message' => 'Sale created successfully',
                'data' => new SaleResource($sale)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating sale',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single sale
     */
    public function show($id)
    {
        $sale = $this->billingService->getSaleById($id);

        if (!$sale) {
            return response()->json([
                'message' => 'Sale not found'
            ], 404);
        }

        return new SaleResource($sale);
    }

    /**
     * Get daily sales summary
     */
    public function dailySummary($date = null)
    {
        $summary = $this->billingService->getDailySalesSummary($date);

        return response()->json([
            'data' => $summary
        ]);
    }
}
