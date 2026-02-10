<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Product $product
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function merchants(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Low Stock Alert: ' . $this->product->productName)
                    ->line('The stock for ' . $this->product->productName . ' has reached the low stock threshold.')
                    ->line('Current Quantity: ' . $this->product->quantity)
                    ->line('Threshold: ' . $this->product->lowStock)
                    ->action('View Product', url('/inventory/' . $this->product->id))
                    ->line('Please reorder soon to avoid stockouts.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'product_id' => $this->product->id,
            'product_name' => $this->product->productName,
            'quantity' => $this->product->quantity,
            'threshold' => $this->product->lowStock,
            'message' => "Low stock alert for {$this->product->productName}",
            'type' => 'low_stock'
        ];
    }
}
