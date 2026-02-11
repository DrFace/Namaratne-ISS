<?php

namespace Database\Seeders;

use App\Models\DiscountCategory;
use Illuminate\Database\Seeder;

class DiscountCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'General', 'type' => 'percentage', 'value' => 0],
            ['name' => 'VIP', 'type' => 'percentage', 'value' => 10],
            ['name' => 'Wholesale', 'type' => 'percentage', 'value' => 15],
            ['name' => 'Retail', 'type' => 'percentage', 'value' => 5],
        ];

        foreach ($categories as $category) {
            DiscountCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
