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
        Schema::create('website_contents', function (Blueprint $table) {
            $table->id();

            // Hero Section
            $table->string('hero_title')->nullable();
            $table->text('hero_subtitle')->nullable();
            $table->string('hero_image')->nullable();

            // Info / Berita Section
            $table->string('info_title')->nullable();
            $table->text('info_description')->nullable();
            $table->string('info_image')->nullable();

            // Video Section
            $table->string('video_title')->nullable();
            $table->text('video_description')->nullable();
            $table->string('video_url')->nullable();

            // Audit
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->timestamps();

            $table->foreign('updated_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('website_contents');
    }
};