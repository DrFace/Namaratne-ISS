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

            // Dashboard Widgets
            [
                'name' => 'View Low Stock Alerts',
                'slug' => 'view_low_stock_alerts',
                'category' => 'dashboard',
                'description' => 'Can view low stock items list on dashboard',
            ],
            [
                'name' => 'View Out of Stock Alerts',
                'slug' => 'view_out_of_stock_alerts',
                'category' => 'dashboard',
                'description' => 'Can view out of stock items list on dashboard',
            ],
            [
                'name' => 'View Recent Transactions',
                'slug' => 'view_recent_transactions',
                'category' => 'dashboard',
                'description' => 'Can view recent transactions list on dashboard',
            ],
            [
                'name' => 'View Top Selling Products',
                'slug' => 'view_top_selling_products',
                'category' => 'dashboard',
                'description' => 'Can view top selling products chart on dashboard',
            ],
            [
                'name' => 'View Sales Trend',
                'slug' => 'view_sales_trend',
                'category' => 'dashboard',
                'description' => 'Can view sales trend chart on dashboard',
            ],
            [
                'name' => 'View Stock by Category',
                'slug' => 'view_stock_by_category',
                'category' => 'dashboard',
                'description' => 'Can view stock by category chart on dashboard',
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
                'name' => 'Add Vehaical Type',
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
                'name' => 'Edit Products',
                'slug' => 'edit_products',
                'category' => 'action',
                'description' => 'Can edit products in inventory',
            ],
            [
                'name' => 'Delete Customers',
                'slug' => 'delete_customers',
                'category' => 'action',
                'description' => 'Can delete customers',
            ],
            [
                'name' => 'Edit Customers',
                'slug' => 'edit_customers',
                'category' => 'action',
                'description' => 'Can edit customers',
            ],
            [
                'name' => 'Change Customer Credit Period',
                'slug' => 'change_customer_credit_period',
                'category' => 'action',
                'description' => 'Can change customer credit period',
            ],
           [
                'name' => 'View Expired Credit Customers',
                'slug' => 'view_expired_credit_customers',
                'category' => 'view',
                'description' => 'Can view dashboard widget showing customers with expired credit periods',
            ],
            [
                'name' => 'Promote to Admin',
                'slug' => 'promote_to_admin',
                'category' => 'action',
                'description' => 'Can promote users to admin role (admin only)',
            ],
            
            // View Permissions
            [
                'name' => 'View Inventory',
                'slug' => 'view_inventory',
                'category' => 'view',
                'description' => 'Can view inventory page',
            ],
            [
                'name' => 'View Customers',
                'slug' => 'view_customers',
                'category' => 'view',
                'description' => 'Can view customers page',
            ],
            [
                'name' => 'View Reports',
                'slug' => 'view_reports',
                'category' => 'view',
                'description' => 'Can view reports page',
            ],
            [
                'name' => 'View Billing',
                'slug' => 'view_billing',
                'category' => 'view',
                'description' => 'Can view billing page',
            ],
            [
                'name' => 'View Settings',
                'slug' => 'view_settings',
                'category' => 'view',
                'description' => 'Can view settings page',
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
