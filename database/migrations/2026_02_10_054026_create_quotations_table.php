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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->string('quotation_number')->unique();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('discount_value', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->enum('status', ['draft', 'sent', 'approved', 'rejected', 'converted', 'expired'])->default('draft');
            $table->date('valid_until')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('converted_to_sale_id')->nullable()->constrained('sales')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index('quotation_number');
            $table->index('customer_id');
            $table->index('status');
            $table->index('valid_until');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
