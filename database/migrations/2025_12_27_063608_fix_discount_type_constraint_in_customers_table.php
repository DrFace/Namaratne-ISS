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
        // SQLite doesn't support modifying CHECK constraints directly
        // We need to recreate the table with the correct constraint
        
        // Step 1: Update any existing 'fixed' values to 'amount'
        DB::statement("UPDATE customers SET discountType = 'amount' WHERE discountType = 'fixed'");
        
        // Step 2: Drop the unique index before renaming
        DB::statement("DROP INDEX IF EXISTS customers_customerid_unique");
        
        // Step 3: Rename the old table
        Schema::rename('customers', 'customers_old');
        
        // Step 4: Create new table with correct constraints
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customerId')->unique()->nullable();
            $table->string('name')->nullable();
            $table->string('contactNumber')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('vatNumber')->nullable();
            $table->decimal('creditLimit', 15, 2)->default(0.00)->nullable();
            $table->string('creditPeriod')->default('30 days')->nullable();
            $table->decimal('currentCreditSpend', 15, 2)->default(0.00)->nullable();
            $table->decimal('netBalance', 15, 2)->default(0.00)->nullable();
            $table->decimal('cashBalance', 15, 2)->default(0.00)->nullable();
            $table->decimal('creditBalance', 15, 2)->default(0.00)->nullable();
            $table->decimal('cardBalance', 15, 2)->default(0.00)->nullable();
            $table->decimal('totalBalance', 15, 2)->default(0.00)->nullable();
            $table->decimal('discountValue', 10, 2)->nullable();
            $table->enum('discountType', ['amount', 'percentage'])->default('amount')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active')->nullable();
            $table->boolean('availability')->default(true)->nullable();
            $table->timestamp('creditLimitReachedAt')->nullable();
            $table->timestamp('creditPeriodExpiresAt')->nullable();
            $table->boolean('canPurchase')->default(true)->nullable();
            $table->timestamps();
        });
        
        // Step 5: Copy data from old table to new table
        DB::statement("INSERT INTO customers SELECT * FROM customers_old");
        
        // Step 6: Drop the old table
        Schema::dropIfExists('customers_old');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename current table
        Schema::rename('customers', 'customers_old');
        
        // Recreate with old constraint
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customerId')->unique()->nullable();
            $table->string('name')->nullable();
            $table->string('contactNumber')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('vatNumber')->nullable();
            $table->decimal('creditLimit', 15, 2)->default(0.00)->nullable();
            $table->string('creditPeriod')->default('30 days')->nullable();
            $table->decimal('currentCreditSpend', 15, 2)->default(0.00)->nullable();
            $table->decimal('netBalance', 15, 2)->default(0.00)->nullable();
            $table->decimal('cashBalance', 15, 2)->default(0.00)->nullable();
            $table->decimal('creditBalance', 15, 2)->default(0.00)->nullable();
            $table->decimal('cardBalance', 15, 2)->default(0.00)->nullable();
            $table->decimal('totalBalance', 15, 2)->default(0.00)->nullable();
            $table->decimal('discountValue', 10, 2)->nullable();
            $table->enum('discountType', ['fixed', 'percentage'])->default('fixed')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active')->nullable();
            $table->boolean('availability')->default(true)->nullable();
            $table->timestamp('creditLimitReachedAt')->nullable();
            $table->timestamp('creditPeriodExpiresAt')->nullable();
            $table->boolean('canPurchase')->default(true)->nullable();
            $table->timestamps();
        });
        
        // Copy data back
        DB::statement("INSERT INTO customers SELECT * FROM customers_old");
        
        // Update 'amount' values back to 'fixed'
        DB::statement("UPDATE customers SET discountType = 'fixed' WHERE discountType = 'amount'");
        
        // Drop old table
        Schema::dropIfExists('customers_old');
    }
};
