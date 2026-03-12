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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->string('name');
            $table->string('type');
            $table->integer('capacity')->default(1);

            $table->integer('price_per_night')->default(0);
            $table->integer('price_transit_3h')->default(0);
            $table->integer('price_transit_6h')->default(0);
            $table->integer('price_transit_12h')->default(0);

            $table->integer('total_rooms')->default(0);
            $table->integer('available_rooms')->default(0);

            $table->text('description')->nullable();
            $table->string('thumbnail')->nullable();

            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};