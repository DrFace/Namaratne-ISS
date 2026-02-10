<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name,
            'contactNumber' => $this->faker->phoneNumber,
            'email' => $this->faker->unique()->safeEmail,
            'address' => $this->faker->address,
            'vatNumber' => 'VAT' . $this->faker->numberBetween(100000, 999999),
            'creditLimit' => $this->faker->randomFloat(2, 1000, 50000),
            'creditPeriod' => $this->faker->randomElement(['30 days', '60 days', '90 days']),
            'status' => 'active',
            'availability' => true,
        ];
    }
}
