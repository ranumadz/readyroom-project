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
        Schema::create('internal_broadcast_dismissals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('internal_broadcast_id')
                ->constrained('internal_broadcasts')
                ->cascadeOnDelete();

            $table->timestamp('dismissed_at')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'internal_broadcast_id'], 'user_broadcast_unique_dismissal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internal_broadcast_dismissals');
    }
};