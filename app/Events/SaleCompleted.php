<?php

namespace App\Events;

use App\Models\Sales;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SaleCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Sales $sale,
        public float $totalAmount,
        public float $profitAmount
    ) {}
}
