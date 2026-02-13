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
            'productName' => $this->productName,
            'productCode' => $this->productCode,
            'productDescription' => $this->productDescription,
            'productImage' => $this->productImage,
            'buyingPrice' => $this->buyingPrice,
            'sellingPrice' => $this->sellingPrice,
            'profitMargin' => $this->profitMargin,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'lowStock' => $this->lowStock,
            'reorder_point' => $this->reorder_point,
            'availability' => $this->availability,
            'brand' => $this->brand,
            'batchNumber' => $this->batchNumber,
            'expiryDate' => $this->expiryDate?->format('Y-m-d'),
            'purchaseDate' => $this->purchaseDate?->format('Y-m-d'),
            'status' => $this->status,
            'seriasId' => $this->seriasId,
            'vehicle_type' => $this->vehicle_type,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
