<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('booking_penalties', function (Blueprint $table) {
            $table->id();

            // Relasi ke booking
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            // Jenis denda (opsional, buat future preset)
            $table->string('penalty_type')->nullable();

            // Judul denda (contoh: Merokok di kamar)
            $table->string('title');

            // Nominal denda
            $table->decimal('amount', 12, 2)->default(0);

            // Catatan tambahan
            $table->text('note')->nullable();

            // Siapa yang input denda
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_penalties');
    }
};