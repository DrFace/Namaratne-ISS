<?php

namespace App\Http\Controllers;

use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    /**
     * Record a new payment for a sale
     */
    public function store(Request $request, $saleId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,credit,bank_transfer,mobile_money',
            'payment_date' => 'nullable|date',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        try {
            $validated['recorded_by'] = auth()->id();
            $payment = $this->paymentService->recordPayment($saleId, $validated);

            return response()->json([
                'message' => 'Payment recorded successfully',
                'payment' => $payment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error recording payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all payments for a sale
     */
    public function index($saleId)
    {
        $payments = $this->paymentService->getPaymentsBySale($saleId);
        $balance = $this->paymentService->calculateRemainingBalance($saleId);

        return response()->json([
            'payments' => $payments,
            'remaining_balance' => $balance,
        ]);
    }

    /**
     * Get payment history
     */
    public function history(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'payment_method', 'sale_id']);
        $payments = $this->paymentService->getPaymentHistory($filters, $request->input('per_page', 50));

        return Inertia::render('Payments/History', [
            'payments' => $payments,
            'filters' => $filters,
        ]);
    }

    /**
     * Delete a payment
     */
    public function destroy($paymentId)
    {
        try {
            $this->paymentService->deletePayment($paymentId);

            return response()->json([
                'message' => 'Payment deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting payment: ' . $e->getMessage(),
            ], 500);
        }
    }
}
