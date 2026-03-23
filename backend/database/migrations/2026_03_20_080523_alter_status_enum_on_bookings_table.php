<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE bookings 
            MODIFY status ENUM(
                'pending',
                'confirmed',
                'cancelled',
                'checked_in',
                'checked_out',
                'cleaning',
                'completed'
            ) NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE bookings 
            MODIFY status ENUM(
                'pending',
                'confirmed',
                'cancelled',
                'checked_in',
                'checked_out'
            ) NOT NULL DEFAULT 'pending'
        ");
    }
};