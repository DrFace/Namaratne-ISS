<?php

namespace App\Services;

use App\Models\Sales;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Process a payment for a sale
     */
    public function processPayment(int $saleId, float $amount, string $method, array $extra = []): Payment
    {
        return DB::transaction(function () use ($saleId, $amount, $method, $extra) {
            $sale = Sales::findOrFail($saleId);

            $payment = Payment::create([
                'sales_id' => $saleId,
                'amount' => $amount,
                'payment_method' => $method,
                'payment_date' => now(),
                'transaction_id' => $extra['transaction_id'] ?? null,
                'notes' => $extra['notes'] ?? null,
            ]);

            // Update sale paid/due amounts
            $sale->increment('paidAmount', $amount);
            $sale->decrement('dueAmount', $amount);

            return $payment;
        });
    }

    /**
     * Get payment history for a sale
     */
    public function getPaymentHistory(int $saleId)
    {
        return Payment::where('sales_id', $saleId)->latest()->get();
    }
}
