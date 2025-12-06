<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Dashboard KPIs
            [
                'name' => 'View Total Stock Value',
                'slug' => 'view_total_stock_value',
                'category' => 'dashboard',
                'description' => 'Can view total stock value KPI on dashboard',
            ],
            [
                'name' => 'View Total Products',
                'slug' => 'view_total_products',
                'category' => 'dashboard',
                'description' => 'Can view total products/SKUs KPI on dashboard',
            ],
            [
                'name' => 'View Low Stock Count',
                'slug' => 'view_low_stock_count',
                'category' => 'dashboard',
                'description' => 'Can view low stock items count KPI on dashboard',
            ],
            [
                'name' => 'View Out of Stock Count',
                'slug' => 'view_out_of_stock_count',
                'category' => 'dashboard',
                'description' => 'Can view out of stock items count KPI on dashboard',
            ],
            [
                'name' => 'View Today Sales',
                'slug' => 'view_today_sales',
                'category' => 'dashboard',
                'description' => 'Can view today\'s sales KPI on dashboard',
            ],
            [
                'name' => 'View Month Sales',
                'slug' => 'view_month_sales',
                'category' => 'dashboard',
                'description' => 'Can view this month\'s sales KPI on dashboard',
            ],
            [
                'name' => 'View Month Profit',
                'slug' => 'view_month_profit',
                'category' => 'dashboard',
                'description' => 'Can view this month\'s profit KPI on dashboard',
            ],
            
            // Actions
            [
                'name' => 'Add Products',
                'slug' => 'add_products',
                'category' => 'action',
                'description' => 'Can add new products to inventory',
            ],
            [
                'name' => 'Restock Products',
                'slug' => 'restock_products',
                'category' => 'action',
                'description' => 'Can add stock to existing products',
            ],
            [
                'name' => 'Add Series',
                'slug' => 'add_series',
                'category' => 'action',
                'description' => 'Can add new product series/categories',
            ],
            [
                'name' => 'Add Customers',
                'slug' => 'add_customers',
                'category' => 'action',
                'description' => 'Can add new customers',
            ],
            [
                'name' => 'Delete Products',
                'slug' => 'delete_products',
                'category' => 'action',
                'description' => 'Can delete products from inventory',
            ],
            [
                'name' => 'Promote to Admin',
                'slug' => 'promote_to_admin',
                'category' => 'action',
                'description' => 'Can promote users to admin role (admin only)',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }
    }
}
