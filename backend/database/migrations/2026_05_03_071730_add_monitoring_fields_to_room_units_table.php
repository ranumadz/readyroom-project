<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('room_units', function (Blueprint $table) {
            if (!Schema::hasColumn('room_units', 'operational_status')) {
                $table->string('operational_status')->default('available');
            }

            if (!Schema::hasColumn('room_units', 'reason')) {
                $table->text('reason')->nullable();
            }

            if (!Schema::hasColumn('room_units', 'is_maintenance')) {
                $table->boolean('is_maintenance')->default(false);
            }

            if (!Schema::hasColumn('room_units', 'is_cleaning')) {
                $table->boolean('is_cleaning')->default(false);
            }
        });

        // Sinkron data lama:
        // status = 1 tetap available, status = 0 jadi inactive.
        DB::table('room_units')
            ->where('status', true)
            ->update([
                'operational_status' => 'available',
                'is_maintenance' => false,
                'is_cleaning' => false,
            ]);

        DB::table('room_units')
            ->where('status', false)
            ->update([
                'operational_status' => 'inactive',
                'is_maintenance' => false,
                'is_cleaning' => false,
            ]);
    }

    public function down(): void
    {
        Schema::table('room_units', function (Blueprint $table) {
            if (Schema::hasColumn('room_units', 'is_cleaning')) {
                $table->dropColumn('is_cleaning');
            }

            if (Schema::hasColumn('room_units', 'is_maintenance')) {
                $table->dropColumn('is_maintenance');
            }

            if (Schema::hasColumn('room_units', 'reason')) {
                $table->dropColumn('reason');
            }

            if (Schema::hasColumn('room_units', 'operational_status')) {
                $table->dropColumn('operational_status');
            }
        });
    }
};