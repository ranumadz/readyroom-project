<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'actual_check_out')) {
                $table->dateTime('actual_check_out')->nullable()->after('check_out');
            }

            if (!Schema::hasColumn('bookings', 'checked_out_at')) {
                $table->dateTime('checked_out_at')->nullable()->after('actual_check_out');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'checked_out_at')) {
                $table->dropColumn('checked_out_at');
            }

            if (Schema::hasColumn('bookings', 'actual_check_out')) {
                $table->dropColumn('actual_check_out');
            }
        });
    }
};