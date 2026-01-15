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
        Schema::create('sponsorship_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->text('excerpt')->nullable();
            $table->string('featured_image_url')->nullable();
            $table->string('sponsor_name'); // Company or individual sponsoring
            $table->string('sponsor_logo_url')->nullable();
            $table->string('sponsor_website')->nullable();
            $table->text('sponsor_description')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // When sponsorship ends
            $table->integer('priority')->default(0); // Higher priority posts shown first
            $table->uuid('created_by'); // Admin who created it
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'published_at']);
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sponsorship_posts');
    }
};
