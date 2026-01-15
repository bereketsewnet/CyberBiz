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
        Schema::create('affiliate_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('affiliate_programs')->onDelete('cascade');
            $table->uuid('affiliate_id'); // User who is the affiliate
            $table->foreign('affiliate_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('code')->unique(); // Unique tracking code
            $table->string('url'); // Generated affiliate URL
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['program_id', 'affiliate_id']); // One link per affiliate per program
            $table->index('code');
            $table->index(['program_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affiliate_links');
    }
};
