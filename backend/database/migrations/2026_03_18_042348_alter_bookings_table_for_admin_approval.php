<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('room_unit_id')
                ->nullable()
                ->after('room_id')
                ->constrained('room_units')
                ->nullOnDelete();

            $table->string('booking_code')->nullable()->after('id');

            $table->text('admin_note')->nullable()->after('payment_status');
            $table->text('rejection_reason_internal')->nullable()->after('admin_note');
            $table->text('rejection_reason_customer')->nullable()->after('rejection_reason_internal');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('room_unit_id');
            $table->dropColumn([
                'booking_code',
                'admin_note',
                'rejection_reason_internal',
                'rejection_reason_customer',
            ]);
        });
    }
};