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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('productName')->nullable();
            $table->string('productCode')->nullable();
            $table->string('productDescription')->nullable();
            $table->string('productImage')->nullable();
            $table->string('buyingPrice')->nullable();
            $table->string('tax')->nullable();
            $table->string('discount')->nullable();
            $table->string('quantity')->nullable();
            $table->string('unit')->nullable();
            $table->string('brand')->nullable();
            $table->string('sellingPrice')->nullable();
            $table->integer('seriasId')->nullable();
            $table->integer('supplierId')->nullable();
            $table->integer('createdBy')->nullable();
            $table->integer('lowStock')->nullable();
            $table->string('batchNumber')->unique()->nullable();
            $table->decimal('profitMargin', 15, 2)->default(0.00)->nullable();
            $table->enum('status', ['pending', 'approved', 'draft', 'active'])->default('pending')->nullable();
            $table->enum('availability', ['instock', 'outstock', 'minstock'])->default('instock')->nullable();
            $table->date('expiryDate')->nullable();
            $table->date('purchaseDate')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
