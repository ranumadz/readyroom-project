<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'cleaning_started_by')) {
                $table->foreignId('cleaning_started_by')
                    ->nullable()
                    ->after('cancelled_at')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('bookings', 'cleaning_started_at')) {
                $table->timestamp('cleaning_started_at')
                    ->nullable()
                    ->after('cleaning_started_by');
            }

            if (!Schema::hasColumn('bookings', 'cleaning_finished_by')) {
                $table->foreignId('cleaning_finished_by')
                    ->nullable()
                    ->after('cleaning_started_at')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('bookings', 'cleaning_finished_at')) {
                $table->timestamp('cleaning_finished_at')
                    ->nullable()
                    ->after('cleaning_finished_by');
            }

            if (!Schema::hasColumn('bookings', 'cleaning_estimation_minutes')) {
                $table->unsignedSmallInteger('cleaning_estimation_minutes')
                    ->nullable()
                    ->after('cleaning_finished_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'cleaning_started_by')) {
                $table->dropForeign(['cleaning_started_by']);
            }

            if (Schema::hasColumn('bookings', 'cleaning_finished_by')) {
                $table->dropForeign(['cleaning_finished_by']);
            }

            if (Schema::hasColumn('bookings', 'cleaning_estimation_minutes')) {
                $table->dropColumn('cleaning_estimation_minutes');
            }

            if (Schema::hasColumn('bookings', 'cleaning_finished_at')) {
                $table->dropColumn('cleaning_finished_at');
            }

            if (Schema::hasColumn('bookings', 'cleaning_finished_by')) {
                $table->dropColumn('cleaning_finished_by');
            }

            if (Schema::hasColumn('bookings', 'cleaning_started_at')) {
                $table->dropColumn('cleaning_started_at');
            }

            if (Schema::hasColumn('bookings', 'cleaning_started_by')) {
                $table->dropColumn('cleaning_started_by');
            }
        });
    }
};