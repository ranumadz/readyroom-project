<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {

            // 🔥 user_id jadi nullable
            $table->foreignId('user_id')->nullable()->change();

            // 🔥 data tamu manual
            $table->string('guest_name')->nullable()->after('user_id');
            $table->string('guest_phone')->nullable()->after('guest_name');
            $table->string('guest_email')->nullable()->after('guest_phone');

            // 🔥 siapa yang input (admin/resepsionis)
            $table->foreignId('created_by')->nullable()->after('guest_email')
                  ->constrained('users')
                  ->nullOnDelete();

            // 🔥 sumber booking
            $table->string('booking_source')->default('customer_app')->after('created_by');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {

            $table->dropColumn([
                'guest_name',
                'guest_phone',
                'guest_email',
                'created_by',
                'booking_source'
            ]);

            // ⚠️ balik lagi ke not nullable (opsional, hati-hati kalau sudah ada data)
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};