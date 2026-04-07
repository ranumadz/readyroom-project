<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('new_phone')->nullable()->after('phone');
            $table->string('new_phone_otp')->nullable()->after('new_phone');
            $table->timestamp('new_phone_otp_expired_at')->nullable()->after('new_phone_otp');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'new_phone',
                'new_phone_otp',
                'new_phone_otp_expired_at',
            ]);
        });
    }
};