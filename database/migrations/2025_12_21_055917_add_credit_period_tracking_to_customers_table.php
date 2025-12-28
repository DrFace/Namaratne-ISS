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
        Schema::table('customers', function (Blueprint $table) {
            $table->timestamp('creditLimitReachedAt')->nullable()->after('creditPeriod');
            $table->timestamp('creditPeriodExpiresAt')->nullable()->after('creditLimitReachedAt');
            $table->boolean('canPurchase')->default(true)->after('creditPeriodExpiresAt');
            
            // Add indexes for performance
            $table->index('creditPeriodExpiresAt');
            $table->index('canPurchase');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['creditPeriodExpiresAt']);
            $table->dropIndex(['canPurchase']);
            $table->dropColumn(['creditLimitReachedAt', 'creditPeriodExpiresAt', 'canPurchase']);
        });
    }
};
