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
        Schema::table('job_postings', function (Blueprint $table) {
            $table->enum('job_type', ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'])->nullable()->after('title');
            $table->string('location')->nullable()->after('job_type');
            $table->string('experience')->nullable()->after('location'); // e.g., "3-5 years", "Entry level"
            $table->json('skills')->nullable()->after('experience'); // Array of skill strings
            $table->text('company_description')->nullable()->after('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_postings', function (Blueprint $table) {
            $table->dropColumn(['job_type', 'location', 'experience', 'skills', 'company_description']);
        });
    }
};
