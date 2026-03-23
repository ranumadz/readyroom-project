<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('refund_amount', 12, 2)->default(0)->after('discount_percent');
            $table->text('refund_reason')->nullable()->after('refund_amount');
            $table->unsignedBigInteger('refunded_by')->nullable()->after('refund_reason');
            $table->timestamp('refunded_at')->nullable()->after('refunded_by');
        });

        DB::statement("
            ALTER TABLE bookings 
            MODIFY payment_status 
            ENUM('unpaid', 'paid', 'refunded') 
            DEFAULT 'unpaid'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE bookings 
            MODIFY payment_status 
            ENUM('unpaid', 'paid') 
            DEFAULT 'unpaid'
        ");

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'refund_amount',
                'refund_reason',
                'refunded_by',
                'refunded_at',
            ]);
        });
    }
};