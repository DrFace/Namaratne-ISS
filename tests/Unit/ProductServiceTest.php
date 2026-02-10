<?php

use App\Models\Product;
use App\Models\User;
use App\Services\ProductService;
use App\Repositories\ProductRepository;
use App\DTOs\CreateProductDTO;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->productService = app(ProductService::class);
});

test('it can create a product', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $data = [
        'productName' => 'Test Product',
        'productCode' => 'TP-001',
        'buyingPrice' => 100,
        'sellingPrice' => 150,
        'quantity' => 10,
        'unit' => 'pcs',
        'status' => 'active'
    ];

    $dto = CreateProductDTO::fromRequest($data);
    $product = $this->productService->createProduct($dto->toArray());

    expect($product)->toBeInstanceOf(Product::class);
    expect($product->productName)->toBe('Test Product');
    expect($product->quantity)->toBe(10);
});

test('it can update stock quantity', function () {
    $product = Product::factory()->create(['quantity' => 10]);
    
    $this->productService->updateStock($product->id, 5);
    
    $product->refresh();
    expect($product->quantity)->toBe(15);
});
