<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE users 
            MODIFY role ENUM(
                'admin',
                'super_admin',
                'boss',
                'receptionist',
                'pengawas',
                'it',
                'housekeeping'
            ) NOT NULL DEFAULT 'admin'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE users 
            MODIFY role ENUM(
                'admin',
                'super_admin',
                'boss',
                'receptionist',
                'pengawas',
                'it'
            ) NOT NULL DEFAULT 'admin'
        ");
    }
};