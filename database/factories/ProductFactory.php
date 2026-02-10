<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\SeriasNumber;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $buyingPrice = $this->faker->randomFloat(2, 10, 500);
        $profitMargin = $this->faker->randomFloat(2, 10, 50);
        $sellingPrice = $buyingPrice * (1 + ($profitMargin / 100));

        return [
            'productName' => $this->faker->words(3, true),
            'productCode' => 'PRD-' . $this->faker->unique()->numberBetween(1000, 9999),
            'productDescription' => $this->faker->paragraph,
            'buyingPrice' => $buyingPrice,
            'tax' => $this->faker->randomElement([0, 5, 12, 18]),
            'discount' => $this->faker->randomElement([0, 5, 10]),
            'quantity' => $this->faker->numberBetween(0, 500),
            'unit' => $this->faker->randomElement(['kg', 'pcs', 'liter', 'box']),
            'brand' => $this->faker->company,
            'sellingPrice' => $sellingPrice,
            'seriasId' => SeriasNumber::factory(),
            'supplierId' => Supplier::factory(),
            'createdBy' => User::factory(),
            'lowStock' => 10,
            'reorder_point' => 15,
            'profitMargin' => $profitMargin,
            'batchNumber' => 'BATCH-' . $this->faker->unique()->numberBetween(100, 999),
            'status' => 'active',
            'availability' => true,
            'expiryDate' => $this->faker->dateTimeBetween('+6 months', '+2 years'),
            'purchaseDate' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
