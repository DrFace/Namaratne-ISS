<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Set wthushan123@gmail.com as admin
        $user = User::where('email', 'wthushan123@gmail.com')->first();
        
        if ($user) {
            $user->update(['role' => 1]); // 1 = Admin
            $this->command->info('User wthushan123@gmail.com has been promoted to Admin!');
        } else {
            $this->command->warn('User wthushan123@gmail.com not found. Please create this user first.');
        }
    }
}
