<?php

namespace Database\Factories;

use App\Models\SeriasNumber;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SeriasNumber>
 */
class SeriasNumberFactory extends Factory
{
    protected $model = SeriasNumber::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'seriasNo' => $this->faker->unique()->word,
            'status' => $this->faker->randomElement(['pending', 'approved', 'draft']),
        ];
    }
}
