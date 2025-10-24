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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->integer('customerId')->nullable();
            $table->json('productId')->nullable();
            $table->json('returnProductId')->nullable();
            $table->integer('totalQuantity')->nullable();
            $table->decimal('totalAmount')->nullable();
            $table->decimal('paidAmount')->nullable();
            $table->decimal('dueAmount')->nullable();
            $table->decimal('creditAmount')->nullable();
            $table->decimal('cardAmount')->nullable();
            $table->decimal('cashAmount')->nullable();
            $table->enum('paymentMethod' , ['cash', 'card', 'credit'])->default('cash')->nullable();
            $table->integer('createdBy')->nullable();
            $table->enum('status' , ['pending', 'approved', 'draft'])->default('pending')->nullable();
            $table->string('billNumber')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
