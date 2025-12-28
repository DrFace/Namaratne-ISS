<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Add discount_category_id column
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('discount_category_id')->nullable()->after('address')->constrained('discount_categories')->onDelete('set null');
        });

        // Step 2: Migrate existing discount data to categories
        $this->migrateExistingDiscounts();

        // Step 3: Drop old discount columns
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['discountValue', 'discountType']);
        });
    }

    /**
     * Migrate existing customer discounts to discount categories
     */
    protected function migrateExistingDiscounts()
    {
        // Get unique discount combinations
       $uniqueDiscounts = DB::table('customers')
            ->select('discountValue', 'discountType')
            ->distinct()
            ->whereNotNull('discountValue')
            ->where('discountValue', '>', 0)
            ->get();

        foreach ($uniqueDiscounts as $discount) {
            // Create discount category
            $categoryId = DB::table('discount_categories')->insertGetId([
                'name' => ucfirst($discount->discountType) . ' ' . $discount->discountValue,
                'type' => $discount->discountType,
                'value' => $discount->discountValue,
                'description' => 'Migrated from existing customer discounts',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign customers to this category
            DB::table('customers')
                ->where('discountValue', $discount->discountValue)
                ->where('discountType', $discount->discountType)
                ->update(['discount_category_id' => $categoryId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back discount columns
        Schema::table('customers', function (Blueprint $table) {
            $table->decimal('discountValue', 10, 2)->nullable()->after('address');
            $table->enum('discountType', ['amount', 'percentage'])->default('amount')->nullable()->after('discountValue');
        });

        // Restore discount values from categories
        $customers = DB::table('customers')->whereNotNull('discount_category_id')->get();
        foreach ($customers as $customer) {
            $category = DB::table('discount_categories')->find($customer->discount_category_id);
            if ($category) {
                DB::table('customers')
                    ->where('id', $customer->id)
                    ->update([
                        'discountValue' => $category->value,
                        'discountType' => $category->type,
                    ]);
            }
        }

        // Drop foreign key and column
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['discount_category_id']);
            $table->dropColumn('discount_category_id');
        });
    }
};
