<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SiteSetting;

class SiteSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create the settings record
        $settings = SiteSetting::firstOrCreate([], []);

        // Update with the provided information
        $settings->update([
            'address' => 'Ayat Zone 5, st 14, Addis Ababa, p.o.box 4051',
            'email' => 'info@cyberbizafrica.com',
            'phone' => '+251912080065',
            'facebook_url' => 'https://facebook.com',
            'twitter_url' => 'https://twitter.com',
            'linkedin_url' => 'https://linkedin.com',
            'instagram_url' => 'https://instagram.com',
            'youtube_url' => 'https://youtube.com',
        ]);
    }
}
