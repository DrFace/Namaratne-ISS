<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customerId,
            'name' => $this->name,
            'contact' => [
                'phone' => $this->contactNumber,
                'email' => $this->email,
                'address' => $this->address,
            ],
            'financials' => [
                'vat_number' => $this->vatNumber,
                'credit_limit' => $this->creditLimit,
                'current_credit_spend' => $this->currentCreditSpend,
                'credit_period' => $this->creditPeriod,
                'net_balance' => $this->netBalance,
                'cash_balance' => $this->cashBalance,
                'credit_balance' => $this->creditBalance,
                'card_balance' => $this->cardBalance,
                'total_balance' => $this->totalBalance,
            ],
            'status' => [
                'is_active' => $this->status === 'active',
                'availability' => $this->availability,
                'can_purchase' => $this->canPurchase,
                'type' => $this->status,
            ],
            'credit_meta' => [
                'limit_reached_at' => $this->creditLimitReachedAt?->toDateTimeString(),
                'period_expires_at' => $this->creditPeriodExpiresAt?->toDateTimeString(),
                'days_remaining' => $this->creditPeriodDays,
                'is_period_expired' => $this->isCreditPeriodExpired,
            ],
            'timestamps' => [
                'created_at' => $this->created_at?->toDateTimeString(),
                'updated_at' => $this->updated_at?->toDateTimeString(),
            ]
        ];
    }
}
