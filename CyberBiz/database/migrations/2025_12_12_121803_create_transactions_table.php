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
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('product_id')->nullable();
            $table->enum('gateway', ['MANUAL', 'CHAPA', 'SANTIM'])->default('MANUAL');
            $table->string('gateway_ref')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['PENDING', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
