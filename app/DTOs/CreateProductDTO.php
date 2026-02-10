<?php

namespace App\DTOs;

readonly class CreateProductDTO
{
    public function __construct(
        public string $productName,
        public string $productCode,
        public ?string $productDescription = null,
        public ?string $productImage = null,
        public float $buyingPrice = 0,
        public float $tax = 0,
        public float $discount = 0,
        public int $quantity = 0,
        public string $unit = 'units',
        public ?string $brand = null,
        public float $sellingPrice = 0,
        public ?int $seriasId = null,
        public ?int $supplierId = null,
        public ?int $lowStock = null,
        public ?int $reorder_point = 0,
        public ?float $profitMargin = null,
        public ?string $batchNumber = null,
        public string $status = 'active',
        public bool $availability = true,
        public ?string $expiryDate = null,
        public ?string $purchaseDate = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            productName: $data['productName'],
            productCode: $data['productCode'],
            productDescription: $data['productDescription'] ?? null,
            productImage: $data['productImage'] ?? null,
            buyingPrice: (float) ($data['buyingPrice'] ?? 0),
            tax: (float) ($data['tax'] ?? 0),
            discount: (float) ($data['discount'] ?? 0),
            quantity: (int) ($data['quantity'] ?? 0),
            unit: $data['unit'] ?? 'units',
            brand: $data['brand'] ?? null,
            sellingPrice: (float) ($data['sellingPrice'] ?? 0),
            seriasId: $data['seriasId'] ?? null,
            supplierId: $data['supplierId'] ?? null,
            lowStock: $data['lowStock'] ?? null,
            reorder_point: isset($data['reorder_point']) ? (int) $data['reorder_point'] : 0,
            profitMargin: isset($data['profitMargin']) ? (float) $data['profitMargin'] : null,
            batchNumber: $data['batchNumber'] ?? null,
            status: $data['status'] ?? 'active',
            availability: (bool) ($data['availability'] ?? true),
            expiryDate: $data['expiryDate'] ?? null,
            purchaseDate: $data['purchaseDate'] ?? null,
        );
    }

    public function toArray(): array
    {
        return (array) $this;
    }
}
