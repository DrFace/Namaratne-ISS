<?php

namespace App\Listeners;

use App\Events\SaleCompleted;
use Illuminate\Support\Facades\Cache;

class RecordSaleMetrics
{
    /**
     * Handle the event.
     */
    public function handle(SaleCompleted $event): void
    {
        // Clear sales cache
        Cache::forget('daily_sales_summary_' . now()->toDateString());
        Cache::forget('monthly_sales_total');
        
        // Log sale completion
        \Log::info('Sale completed', [
            'sale_id' => $event->sale->id,
            'bill_number' => $event->sale->billNumber,
            'total_amount' => $event->totalAmount,
            'profit_amount' => $event->profitAmount,
            'customer_id' => $event->sale->customerId,
        ]);

        // TODO: Update sales analytics
        // TODO: Update customer lifetime value
        // TODO: Send sale receipt email
        // TODO: Update best-selling products ranking
    }
}
