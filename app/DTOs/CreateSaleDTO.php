<?php

namespace App\DTOs;

readonly class CreateSaleDTO
{
    /**
     * @param array<int, array{id: int, quantity: int, price: float}> $products
     */
    public function __construct(
        public int $customerId,
        public array $products,
        public float $paidAmount = 0,
        public float $discount_value = 0,
        public float $creditAmount = 0,
        public float $cardAmount = 0,
        public float $cashAmount = 0,
        public string $paymentMethod = 'cash',
        public ?int $createdBy = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            customerId: (int) $data['customerId'],
            products: $data['products'],
            paidAmount: (float) ($data['paidAmount'] ?? 0),
            discount_value: (float) ($data['discount_value'] ?? 0),
            creditAmount: (float) ($data['creditAmount'] ?? 0),
            cardAmount: (float) ($data['cardAmount'] ?? 0),
            cashAmount: (float) ($data['cashAmount'] ?? 0),
            paymentMethod: $data['paymentMethod'] ?? 'cash',
            createdBy: $data['createdBy'] ?? auth()->id(),
        );
    }

    public function toArray(): array
    {
        return (array) $this;
    }
}
