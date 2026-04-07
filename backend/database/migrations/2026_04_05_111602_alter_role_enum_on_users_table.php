<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role ENUM(
                'customer',
                'boss',
                'super_admin',
                'admin',
                'receptionist',
                'pengawas',
                'it',
                'it_staff'
            ) NOT NULL DEFAULT 'customer'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role ENUM(
                'customer',
                'admin',
                'receptionist',
                'it_staff'
            ) NOT NULL DEFAULT 'customer'
        ");
    }
};