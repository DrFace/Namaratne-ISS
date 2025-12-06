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
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->integer('role'); // 1=Admin, 2=Stock Keeper, 3=User
            $table->string('permission_slug');
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
            
            $table->unique(['role', 'permission_slug']);
            $table->foreign('permission_slug')->references('slug')->on('permissions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
