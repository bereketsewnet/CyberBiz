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
        Schema::create('product_resources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->enum('type', ['VIDEO', 'DOCUMENT', 'FILE']);
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('file_path')->nullable(); // for uploaded files
            $table->string('external_url')->nullable(); // for external URLs
            $table->string('file_name')->nullable(); // original filename
            $table->unsignedBigInteger('file_size')->nullable(); // file size in bytes
            $table->string('mime_type')->nullable();
            $table->integer('order')->default(0); // for ordered sequence
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index('product_id');
            $table->index('order');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_resources');
    }
};
