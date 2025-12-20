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
        Schema::create('applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('job_id');
            $table->uuid('seeker_id');
            $table->string('cv_path');
            $table->string('cv_original_name');
            $table->text('cover_letter')->nullable();
            $table->timestamps();

            $table->foreign('job_id')->references('id')->on('job_postings')->onDelete('cascade');
            $table->foreign('seeker_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['job_id', 'seeker_id']); // Prevent duplicate applications
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
