<?php

namespace App\Listeners;

use App\Events\CustomerCreditExceeded;
use Illuminate\Support\Facades\Log;

class LogCreditExceeded
{
    /**
     * Handle the event.
     */
    public function handle(CustomerCreditExceeded $event): void
    {
        Log::warning("Customer credit limit exceeded", [
            'customer_id' => $event->customer->id,
            'customer_name' => $event->customer->name,
            'exceeded_amount' => $event->exceededAmount,
            'total_balance' => $event->customer->totalBalance,
            'credit_limit' => $event->customer->creditLimit,
        ]);
    }
}
