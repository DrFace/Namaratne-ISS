<?php

namespace App\DTOs;

readonly class UpdateProductDTO
{
    public function __construct(
        public ?string $productName = null,
        public ?string $productCode = null,
        public ?string $productDescription = null,
        public ?float $buyingPrice = null,
        public ?float $sellingPrice = null,
        public ?int $quantity = null,
        public ?string $status = null,
        public ?int $lowStock = null,
        public ?int $reorder_point = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            productName: $data['productName'] ?? null,
            productCode: $data['productCode'] ?? null,
            productDescription: $data['productDescription'] ?? null,
            buyingPrice: isset($data['buyingPrice']) ? (float) $data['buyingPrice'] : null,
            sellingPrice: isset($data['sellingPrice']) ? (float) $data['sellingPrice'] : null,
            quantity: isset($data['quantity']) ? (int) $data['quantity'] : null,
            status: $data['status'] ?? null,
            lowStock: isset($data['lowStock']) ? (int) $data['lowStock'] : null,
            reorder_point: isset($data['reorder_point']) ? (int) $data['reorder_point'] : null,
        );
    }

    public function toArray(): array
    {
        return array_filter((array) $this, fn($value) => $value !== null);
    }
}
