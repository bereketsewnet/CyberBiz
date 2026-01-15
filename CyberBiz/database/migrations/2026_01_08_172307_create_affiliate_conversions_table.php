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
        Schema::create('affiliate_conversions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('link_id')->constrained('affiliate_links')->onDelete('cascade');
            $table->foreignId('click_id')->nullable()->constrained('affiliate_clicks')->onDelete('set null');
            $table->string('transaction_id')->nullable(); // External transaction ID
            $table->decimal('amount', 10, 2)->default(0); // Conversion amount
            $table->decimal('commission', 10, 2)->default(0); // Calculated commission
            $table->enum('status', ['pending', 'approved', 'paid', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('converted_at');
            $table->timestamps();
            
            $table->index(['link_id', 'converted_at']);
            $table->index('status');
            $table->index('converted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affiliate_conversions');
    }
};
