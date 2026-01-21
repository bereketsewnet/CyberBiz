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
        Schema::table('affiliate_programs', function (Blueprint $table) {
            // Impression-based commission: X birr per N impressions
            $table->decimal('impression_rate', 10, 2)->nullable()->after('commission_rate');
            $table->unsignedInteger('impression_unit')->nullable()->after('impression_rate'); // e.g. 1000 impressions

            // Click-based commission: Y birr per M clicks
            $table->decimal('click_rate', 10, 2)->nullable()->after('impression_unit');
            $table->unsignedInteger('click_unit')->nullable()->after('click_rate'); // e.g. 300 clicks
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('affiliate_programs', function (Blueprint $table) {
            $table->dropColumn(['impression_rate', 'impression_unit', 'click_rate', 'click_unit']);
        });
    }
};


