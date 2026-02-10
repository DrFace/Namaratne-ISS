<?php

namespace App\DTOs;

readonly class CreateCustomerDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public ?string $contactNumber = null,
        public ?string $address = null,
        public float $creditLimit = 0,
        public string $status = 'active',
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            contactNumber: $data['contactNumber'] ?? null,
            address: $data['address'] ?? null,
            creditLimit: (float) ($data['creditLimit'] ?? 0),
            status: $data['status'] ?? 'active',
        );
    }

    public function toArray(): array
    {
        return (array) $this;
    }
}
