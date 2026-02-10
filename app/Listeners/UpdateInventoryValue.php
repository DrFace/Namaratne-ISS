<?php

namespace App\Listeners;

use App\Events\ProductStockUpdated;
use Illuminate\Support\Facades\Cache;

class UpdateInventoryValue
{
    /**
     * Handle the event.
     */
    public function handle(ProductStockUpdated $event): void
    {
        // Clear inventory cache when stock changes
        Cache::forget('total_inventory_value');
        Cache::forget('inventory_stats');
        
        // Log stock movement
        \Log::info('Stock updated', [
            'product_id' => $event->product->id,
            'product_code' => $event->product->productCode,
            'old_quantity' => $event->oldQuantity,
            'new_quantity' => $event->newQuantity,
            'action' => $event->action,
            'difference' => $event->newQuantity - $event->oldQuantity,
        ]);

        // TODO: Update inventory analytics
        // TODO: Trigger reorder if needed
        // TODO: Update warehouse inventory tracking
    }
}
