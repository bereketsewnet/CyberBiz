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
        Schema::create('job_postings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('employer_id');
            $table->string('title');
            $table->longText('description_html');
            $table->enum('status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'])->default('DRAFT');
            $table->timestamp('expires_at')->nullable();
            $table->json('ld_json')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('employer_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('title'); // Index title for faster searches
            // Note: description_html is longText, cannot be indexed directly
            // Search will use LIKE queries on description_html
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
