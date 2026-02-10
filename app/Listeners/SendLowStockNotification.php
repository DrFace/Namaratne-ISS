<?php

namespace App\Listeners;

use App\Events\LowStockAlert;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendLowStockNotification
{
    /**
     * Handle the event.
     */
    public function handle(LowStockAlert $event): void
    {
        // Log the low stock alert
        Log::warning('Low stock alert', [
            'product_id' => $event->product->id,
            'product_name' => $event->product->productName,
            'product_code' => $event->product->productCode,
            'current_quantity' => $event->currentQuantity,
            'threshold' => $event->threshold,
        ]);

        // TODO: Send email notification to admins
        // TODO: Create database notification
        // TODO: Send push notification (mobile)
        
        // Example: You can add notification logic here
        // $admins = User::where('role', 'admin')->get();
        // Notification::send($admins, new LowStockNotification($event->product));
    }
}
