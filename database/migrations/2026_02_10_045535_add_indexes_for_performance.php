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
        // Add indexes to products table
        Schema::table('products', function (Blueprint $table) {
            $table->index('productCode');
            $table->index(['productCode', 'status']);
            $table->index('status');
            $table->index('batchNumber');
            $table->index('expiryDate');
            $table->index('supplierId');
            $table->index(['status', 'availability']);
        });

        // Add indexes to customers table
        Schema::table('customers', function (Blueprint $table) {
            $table->index('customerId');
            $table->index('email');
            $table->index('contactNumber');
            $table->index('status');
            $table->index('discount_category_id');
        });

        // Add indexes to sales table
        Schema::table('sales', function (Blueprint $table) {
            $table->index('billNumber');
            $table->index('customerId');
            $table->index('createdBy');
            $table->index('status');
            $table->index(['created_at', 'status']);
            $table->index('created_at');
        });

        // Add indexes to sales_details table
        Schema::table('sales_details', function (Blueprint $table) {
            $table->index('salesId');
            $table->index('productId');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['productCode']);
            $table->dropIndex(['productCode', 'status']);
            $table->dropIndex(['status']);
            $table->dropIndex(['batchNumber']);
            $table->dropIndex(['expiryDate']);
            $table->dropIndex(['supplierId']);
            $table->dropIndex(['status', 'availability']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['customerId']);
            $table->dropIndex(['email']);
            $table->dropIndex(['contactNumber']);
            $table->dropIndex(['status']);
            $table->dropIndex(['discount_category_id']);
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex(['billNumber']);
            $table->dropIndex(['customerId']);
            $table->dropIndex(['createdBy']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at', 'status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('sales_details', function (Blueprint $table) {
            $table->dropIndex(['salesId']);
            $table->dropIndex(['productId']);
        });
    }

};
