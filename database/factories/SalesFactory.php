<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Sales;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sales>
 */
class SalesFactory extends Factory
{
    protected $model = Sales::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalAmount = $this->faker->randomFloat(2, 50, 2000);
        $paidAmount = $this->faker->randomFloat(2, 0, $totalAmount);

        return [
            'customerId' => Customer::factory(),
            'productId' => [], // Will be filled in by relations or manually
            'totalQuantity' => $this->faker->numberBetween(1, 10),
            'totalAmount' => $totalAmount,
            'paidAmount' => $paidAmount,
            'dueAmount' => $totalAmount - $paidAmount,
            'paymentMethod' => $this->faker->randomElement(['cash', 'card', 'credit']),
            'createdBy' => User::factory(),
            'status' => 'approved',
            'billNumber' => 'BILL-' . $this->faker->unique()->numberBetween(100000, 999999),
        ];
    }
}
