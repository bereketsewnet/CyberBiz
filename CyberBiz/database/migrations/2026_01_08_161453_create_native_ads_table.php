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
        Schema::create('native_ads', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->string('link_url');
            $table->enum('position', ['content_inline', 'sidebar', 'footer', 'between_posts', 'after_content'])->default('content_inline');
            $table->enum('type', ['sponsored', 'advertisement', 'promoted'])->default('advertisement');
            $table->string('advertiser_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('impressions')->default(0);
            $table->integer('clicks')->default(0);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->integer('priority')->default(0); // Higher priority ads shown first
            $table->timestamps();
            
            $table->index(['position', 'is_active']);
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('native_ads');
    }
};
