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
        Schema::table('website_contents', function (Blueprint $table) {
            $table->string('promo2_title')->nullable()->after('info_image');
            $table->text('promo2_description')->nullable()->after('promo2_title');
            $table->string('promo2_image')->nullable()->after('promo2_description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('website_contents', function (Blueprint $table) {
            $table->dropColumn([
                'promo2_title',
                'promo2_description',
                'promo2_image',
            ]);
        });
    }
};