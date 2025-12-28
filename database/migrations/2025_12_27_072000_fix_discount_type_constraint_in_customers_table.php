<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the customers table completely
        Schema::dropIfExists('customers');
        
        // Recreate the customers table with correct structure
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
            $table->foreignId('discount_category_id')->nullable()->constrained('discount_categories')->onDelete('set null');
            $table->enum('status', ['active', 'inactive'])->default('active')->nullable();
            $table->boolean('availability')->default(true)->nullable();
            $table->timestamp('creditLimitReachedAt')->nullable();
            $table->timestamp('creditPeriodExpiresAt')->nullable();
            $table->boolean('canPurchase')->default(true)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
