<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Status tutup booking sementara untuk hotel
        if (!Schema::hasColumn('hotels', 'booking_is_closed')) {
            Schema::table('hotels', function (Blueprint $table) {
                $table->boolean('booking_is_closed')
                    ->default(false)
                    ->after('status');
            });
        }

        // Alasan kenapa booking hotel ditutup
        if (!Schema::hasColumn('hotels', 'booking_closed_reason')) {
            Schema::table('hotels', function (Blueprint $table) {
                $table->string('booking_closed_reason')
                    ->nullable()
                    ->after('booking_is_closed');
            });
        }

        // Jam kapan hotel boleh otomatis dibuka lagi
        if (!Schema::hasColumn('hotels', 'booking_reopen_at')) {
            Schema::table('hotels', function (Blueprint $table) {
                $table->dateTime('booking_reopen_at')
                    ->nullable()
                    ->after('booking_closed_reason');
            });
        }
    }

    public function down(): void
    {
        $columns = [];

        if (Schema::hasColumn('hotels', 'booking_is_closed')) {
            $columns[] = 'booking_is_closed';
        }

        if (Schema::hasColumn('hotels', 'booking_closed_reason')) {
            $columns[] = 'booking_closed_reason';
        }

        if (Schema::hasColumn('hotels', 'booking_reopen_at')) {
            $columns[] = 'booking_reopen_at';
        }

        if (count($columns) > 0) {
            Schema::table('hotels', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }
    }
};