<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@readyroom.com'],
            [
                'name' => 'Super Admin ReadyRoom',
                'email' => 'superadmin@readyroom.com',
                'password' => Hash::make('12345678'),
                'role' => 'super_admin',
            ]
        );
    }
}