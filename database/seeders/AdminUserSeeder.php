<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'password' => Hash::make('AdminUser@678123'),
                'role' => 1, // 1 = Admin
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Default Admin user (admin@admin.com) created successfully!');
    }
}
