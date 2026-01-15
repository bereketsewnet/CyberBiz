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
        Schema::create('affiliate_programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['percentage', 'fixed'])->default('percentage'); // Commission type
            $table->decimal('commission_rate', 5, 2)->default(0); // Percentage or fixed amount
            $table->string('target_url'); // URL to promote
            $table->boolean('is_active')->default(true);
            $table->string('cookie_duration')->default('30'); // Days to track conversions
            $table->timestamps();
            
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affiliate_programs');
    }
};
