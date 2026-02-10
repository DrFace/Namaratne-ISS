<?php

use App\Models\Product;
use App\Models\Customer;
use App\Models\Sales;
use App\Services\BillingService;
use App\DTOs\CreateSaleDTO;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->billingService = app(BillingService::class);
});

test('it can create a sale and reduce stock', function () {
    $product = Product::factory()->create(['quantity' => 100, 'sellingPrice' => 200]);
    $customer = Customer::factory()->create();

    $data = [
        'customerId' => $customer->id,
        'products' => [
            ['id' => $product->id, 'quantity' => 2, 'price' => 200]
        ],
        'paidAmount' => 400,
        'paymentMethod' => 'cash',
        'status' => 'approved'
    ];

    $dto = CreateSaleDTO::fromRequest($data);
    $sale = $this->billingService->createSale($dto->toArray());

    expect($sale)->toBeInstanceOf(Sales::class);
    expect((float) $sale->totalAmount)->toBe(400.0);
    
    $product->refresh();
    expect($product->quantity)->toBe(98);
});

test('it throws exception if stock is insufficient', function () {
    $product = Product::factory()->create(['quantity' => 5]);
    $customer = Customer::factory()->create();

    $data = [
        'customerId' => $customer->id,
        'products' => [
            ['id' => $product->id, 'quantity' => 10, 'price' => 100]
        ],
        'paymentMethod' => 'cash'
    ];

    expect(fn() => $this->billingService->createSale($data))->toThrow(Exception::class);
});
