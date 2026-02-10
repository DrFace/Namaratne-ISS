<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'name' => $this->productName,
            'code' => $this->productCode,
            'description' => $this->productDescription,
            'image' => $this->productImage,
            'prices' => [
                'buying' => $this->buyingPrice,
                'selling' => $this->sellingPrice,
                'profit_margin' => $this->profitMargin,
            ],
            'inventory' => [
                'quantity' => $this->quantity,
                'unit' => $this->unit,
                'low_stock_threshold' => $this->lowStock,
                'reorder_point' => $this->reorder_point,
                'availability' => $this->availability,
            ],
            'metadata' => [
                'brand' => $this->brand,
                'batch_number' => $this->batchNumber,
                'expiry_date' => $this->expiryDate?->format('Y-m-d'),
                'purchase_date' => $this->purchaseDate?->format('Y-m-d'),
                'status' => $this->status,
            ],
            'timestamps' => [
                'created_at' => $this->created_at?->toDateTimeString(),
                'updated_at' => $this->updated_at?->toDateTimeString(),
            ]
        ];
    }
}
