<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('room_facilities')) {
            Schema::create('room_facilities', function (Blueprint $table) {
                $table->id();

                $table->foreignId('room_id')
                    ->constrained('rooms')
                    ->cascadeOnDelete();

                $table->foreignId('facility_id')
                    ->constrained('facilities')
                    ->cascadeOnDelete();

                $table->timestamps();

                $table->unique(['room_id', 'facility_id']);
            });
        } 
    }

    public function down(): void
    {
        Schema::dropIfExists('room_facilities');
    }
};