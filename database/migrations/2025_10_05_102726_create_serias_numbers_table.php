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
        Schema::create('serias_numbers', function (Blueprint $table) {
            $table->id();
            $table->string('seriasNo')->nullable();
            $table->enum('status', ['pending', 'approved', 'draft', 'active', 'inactive'])->default('pending')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('serias_numbers');
    }
};
