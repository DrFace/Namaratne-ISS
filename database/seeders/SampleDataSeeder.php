<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\DiscountCategory;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Sales;
use App\Models\SalesDetails;
use App\Models\SeriasNumber;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        try {
            DB::beginTransaction();
            
            // 1. Vehicle Types
            $types = ['Toyota Corolla', 'Honda Civic', 'Mitsubishi Pajero', 'Suzuki Swift', 'Nissan X-Trail'];
            foreach ($types as $type) {
                SeriasNumber::create(['seriasNo' => $type, 'status' => 'approved']);
            }
            $vehicleTypes = SeriasNumber::all();

            // 2. Suppliers
            $suppliersData = [
                ['name' => 'Lanka Auto Parts', 'company' => 'Lanka Auto (Pvt) Ltd'],
                ['name' => 'Global Spares', 'company' => 'Global Spares Hub'],
                ['name' => 'City Tires', 'company' => 'City Tire Center'],
            ];
            foreach ($suppliersData as $s) {
                Supplier::create([
                    'supplierName' => $s['name'],
                    'companyName' => $s['company'],
                    'supplierAddress' => '123 Spares St, Colombo',
                    'supplierPhone' => '0112233445',
                    'supplierEmail' => strtolower(str_replace(' ', '', $s['name'])) . '@example.com',
                    'status' => 'approved',
                    'availibility' => 'active',
                    'categories' => ['engine', 'body', 'electrical']
                ]);
            }
            $allSuppliers = Supplier::all();

            // 3. Products
            $productsSample = [
                ['name' => 'Brake Pad Set', 'price' => 4500, 'cost' => 3200],
                ['name' => 'Oil Filter', 'price' => 1200, 'cost' => 800],
                ['name' => 'Spark Plug', 'price' => 850, 'cost' => 600],
                ['name' => 'Air Filter', 'price' => 2200, 'cost' => 1500],
                ['name' => 'Wiper Blade', 'price' => 1800, 'cost' => 1200],
                ['name' => 'Headlight Bulb', 'price' => 3500, 'cost' => 2400],
                ['name' => 'Radiator Coolant', 'price' => 1500, 'cost' => 1000],
                ['name' => 'Battery 12V', 'price' => 18500, 'cost' => 14000],
                ['name' => 'Timing Belt', 'price' => 6500, 'cost' => 4800],
                ['name' => 'Shock Absorber', 'price' => 12500, 'cost' => 9500],
            ];

            foreach ($productsSample as $p) {
                Product::create([
                    'productCode' => 'PRD-' . strtoupper(Str::random(6)),
                    'productName' => $p['name'],
                    'batchNumber' => 'BATCH-' . strtoupper(Str::random(8)),
                    'quantity' => rand(20, 100),
                    'buyingPrice' => $p['cost'],
                    'sellingPrice' => $p['price'],
                    'lowStock' => 10,
                    'status' => 'approved',
                    'availability' => 'instock',
                    'seriasId' => $vehicleTypes->random()->id,
                    'supplierId' => $allSuppliers->random()->id,
                    'createdBy' => 1
                ]);
            }
            $allProducts = Product::all();

            // 4. Discount Categories
            DiscountCategory::create(['name' => 'Regular', 'type' => 'percentage', 'value' => 0, 'status' => 'active']);
            DiscountCategory::create(['name' => 'Loyalty', 'type' => 'percentage', 'value' => 5, 'status' => 'active']);
            DiscountCategory::create(['name' => 'Wholesale', 'type' => 'percentage', 'value' => 10, 'status' => 'active']);
            $discountCategories = DiscountCategory::all();

            // 5. Customers
            for ($i = 1; $i <= 10; $i++) {
                Customer::create([
                    'name' => 'Sample Customer ' . $i,
                    'contactNumber' => '077' . rand(1000000, 9999999),
                    'email' => 'customer' . $i . '@example.com',
                    'creditLimit' => rand(50000, 200000),
                    'discount_category_id' => $discountCategories->random()->id,
                    'status' => 'active', // FIXED: was 'approved'
                    'availability' => true
                ]);
            }
            $allCustomers = Customer::all();

            // 6. Sample Sales
            for ($i = 0; $i < 15; $i++) {
                $customer = $allCustomers->random();
                $saleProducts = $allProducts->random(rand(2, 4));
                $totalAmount = 0;

                $sale = Sales::create([
                    'billNumber' => 'INV-' . date('Ymd') . '-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                    'customerId' => $customer->id,
                    'paymentMethod' => ['cash', 'card', 'credit'][rand(0, 2)],
                    'totalAmount' => 0,
                    'status' => 'approved',
                    'createdBy' => 1,
                    'productId' => $saleProducts->pluck('id')->toArray()
                ]);

                foreach ($saleProducts as $product) {
                    $qty = rand(1, 4);
                    $subtotal = $product->sellingPrice * $qty;
                    SalesDetails::create([
                        'salesId' => $sale->id,
                        'productId' => $product->id,
                        'quantity' => $qty,
                        'salePrice' => $product->sellingPrice,
                        'totalAmount' => $subtotal
                    ]);
                    $totalAmount += $subtotal;
                }

                $sale->update(['totalAmount' => $totalAmount]);
            }

            // 7. Sample Purchase Orders
            for ($i = 0; $i < 5; $i++) {
                $supplier = $allSuppliers->random();
                $poProducts = $allProducts->random(rand(2, 4));
                $totalAmount = 0;

                $po = PurchaseOrder::create([
                    'po_number' => 'PO-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                    'supplier_id' => $supplier->id,
                    'order_date' => now()->subDays(rand(1, 10)),
                    'status' => 'received',
                    'total_amount' => 0,
                    'created_by' => 1,
                    'received_by' => 1
                ]);

                foreach ($poProducts as $product) {
                    $qty = rand(10, 50);
                    $cost = $product->buyingPrice;
                    PurchaseOrderItem::create([
                        'purchase_order_id' => $po->id,
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'unit_cost' => $cost,
                        'total_cost' => $qty * $cost
                    ]);
                    $totalAmount += ($qty * $cost);
                }

                $po->update(['total_amount' => $totalAmount]);
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Seeder failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
