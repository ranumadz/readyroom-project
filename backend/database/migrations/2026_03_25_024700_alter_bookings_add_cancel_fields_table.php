<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->text('cancel_reason')->nullable()->after('rejection_reason_customer');
            $table->unsignedBigInteger('cancelled_by')->nullable()->after('cancel_reason');
            $table->timestamp('cancelled_at')->nullable()->after('cancelled_by');

            $table->foreign('cancelled_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn([
                'cancel_reason',
                'cancelled_by',
                'cancelled_at',
            ]);
        });
    }
};