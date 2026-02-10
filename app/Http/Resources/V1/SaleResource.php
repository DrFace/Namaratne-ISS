<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
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
            'bill_number' => $this->billNumber,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'totals' => [
                'quantity' => $this->totalQuantity,
                'amount' => $this->totalAmount,
                'paid' => $this->paidAmount,
                'due' => $this->dueAmount,
                'discount' => $this->discount_value,
            ],
            'payment' => [
                'method' => $this->paymentMethod,
                'cash' => $this->cashAmount,
                'card' => $this->cardAmount,
                'credit' => $this->creditAmount,
            ],
            'status' => $this->status,
            'items' => $this->items ? $this->items->map(fn($item) => [
                'id' => $item->id,
                'product_id' => $item->productId,
                'product_name' => $item->product?->productName,
                'quantity' => $item->quantity,
                'unit_price' => $item->unitPrice,
                'total' => $item->totalPrice,
            ]) : null,
            'creator' => [
                'id' => $this->createdBy,
                'name' => $this->createdByUser?->name,
            ],
            'timestamps' => [
                'created_at' => $this->created_at?->toDateTimeString(),
                'updated_at' => $this->updated_at?->toDateTimeString(),
            ]
        ];
    }
}
