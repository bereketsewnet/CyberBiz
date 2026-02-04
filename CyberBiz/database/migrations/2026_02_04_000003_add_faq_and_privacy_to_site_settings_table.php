<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->text('faq_q1')->nullable()->after('youtube_url');
            $table->text('faq_a1')->nullable()->after('faq_q1');
            $table->text('faq_q2')->nullable()->after('faq_a1');
            $table->text('faq_a2')->nullable()->after('faq_q2');
            $table->text('faq_q3')->nullable()->after('faq_a2');
            $table->text('faq_a3')->nullable()->after('faq_q3');
            $table->longText('privacy_policy')->nullable()->after('faq_a3');
        });

        // Seed default FAQ content for existing record (if any)
        $defaultFaq = [
            'faq_q1' => 'How can I access content of the site?',
            'faq_a1' => 'You can browse jobs and courses for free. Some premium content may require registration or purchase.',
            'faq_q2' => 'Is the job board free to access?',
            'faq_a2' => 'Yes, browsing and searching for jobs is completely free. You can view job listings and apply without any cost.',
            'faq_q3' => 'How can I access the cybercoach service?',
            'faq_a3' => 'Our virtual coaching services on program lifecycle management and leadership skills are available through our courses section. Browse our catalog to find relevant training programs.',
        ];

        DB::table('site_settings')
            ->limit(1)
            ->update($defaultFaq);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'faq_q1',
                'faq_a1',
                'faq_q2',
                'faq_a2',
                'faq_q3',
                'faq_a3',
                'privacy_policy',
            ]);
        });
    }
};


