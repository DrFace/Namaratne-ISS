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
        // Modify the status enum to include 'active'
        DB::statement("ALTER TABLE products MODIFY COLUMN status ENUM('pending', 'approved', 'draft', 'active') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert ensuring data integrity (though strictly reverting data loss is hard for enums)
        // We will just leave it or revert to original if needed, but for now we keep 'active' if data exists
        // To be safe, we won't strictly remove 'active' in down() to avoid data loss if we rollback
        // But technically we should:
        // DB::statement("ALTER TABLE products MODIFY COLUMN status ENUM('pending', 'approved', 'draft') DEFAULT 'pending'");
    }
};
