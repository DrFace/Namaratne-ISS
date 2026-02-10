<?php

namespace App\Notifications;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CreditLimitExceededNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Customer $customer,
        public float $exceededAmount
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
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Credit Limit Exceeded: ' . $this->customer->name)
                    ->line('The credit limit for customer ' . $this->customer->name . ' has been exceeded.')
                    ->line('Exceeded Amount: ' . number_format($this->exceededAmount, 2))
                    ->line('Current Credit Spend: ' . number_format($this->customer->currentCreditSpend, 2))
                    ->line('Credit Limit: ' . number_format($this->customer->creditLimit, 2))
                    ->action('View Customer', url('/customers/' . $this->customer->id))
                    ->line('Please review the customer\'s credit status.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'customer_id' => $this->customer->id,
            'customer_name' => $this->customer->name,
            'exceeded_amount' => $this->exceededAmount,
            'message' => "Credit limit exceeded for {$this->customer->name}",
            'type' => 'credit_exceeded'
        ];
    }
}
