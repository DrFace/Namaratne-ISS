<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Sales;
use App\Models\SalesDetails;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SalesDetails>
 */
class SalesDetailsFactory extends Factory
{
    protected $model = SalesDetails::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = $this->faker->numberBetween(1, 5);
        $price = $this->faker->randomFloat(2, 10, 500);

        return [
            'salesId' => Sales::factory(),
            'productId' => Product::factory(),
            'quantity' => $quantity,
            'salePrice' => $price,
            'descount' => 0,
            'totalAmount' => $quantity * $price,
            'returnQuantity' => 0,
        ];
    }
}
