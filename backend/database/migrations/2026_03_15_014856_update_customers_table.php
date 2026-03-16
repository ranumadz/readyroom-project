<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {

            // hapus kolom yang tidak dipakai
            $table->dropColumn(['email', 'ktp_photo', 'remember_token']);

            // tambah kolom verifikasi OTP
            $table->boolean('is_verified')->default(false)->after('password');

        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {

            $table->string('email')->nullable();
            $table->string('ktp_photo')->nullable();
            $table->rememberToken();

            $table->dropColumn('is_verified');

        });
    }
};