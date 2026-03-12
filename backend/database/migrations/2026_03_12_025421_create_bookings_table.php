<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');

            $table->enum('booking_type', ['transit', 'overnight'])->default('transit');

            $table->integer('duration_hours')->nullable();

            $table->dateTime('check_in');
            $table->dateTime('check_out');

            $table->integer('total_price')->default(0);

            $table->enum('status', [
                'pending',
                'confirmed',
                'checked_in',
                'checked_out',
                'cancelled'
            ])->default('pending');

            $table->enum('payment_status', [
                'unpaid',
                'paid',
                'refunded'
            ])->default('unpaid');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};