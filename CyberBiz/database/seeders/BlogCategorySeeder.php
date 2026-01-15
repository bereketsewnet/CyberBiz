<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Technology',
                'slug' => 'technology',
                'description' => 'Latest technology news, trends, and innovations',
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'description' => 'Business strategies, entrepreneurship, and industry insights',
            ],
            [
                'name' => 'Marketing',
                'slug' => 'marketing',
                'description' => 'Digital marketing, SEO, social media, and advertising',
            ],
            [
                'name' => 'Web Development',
                'slug' => 'web-development',
                'description' => 'Web development tutorials, frameworks, and best practices',
            ],
            [
                'name' => 'Design',
                'slug' => 'design',
                'description' => 'UI/UX design, graphic design, and creative inspiration',
            ],
            [
                'name' => 'Career',
                'slug' => 'career',
                'description' => 'Career advice, job opportunities, and professional development',
            ],
            [
                'name' => 'Education',
                'slug' => 'education',
                'description' => 'Educational content, courses, and learning resources',
            ],
            [
                'name' => 'News',
                'slug' => 'news',
                'description' => 'Industry news, updates, and announcements',
            ],
        ];

        foreach ($categories as $category) {
            BlogCategory::firstOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                ]
            );
        }

        $this->command->info('✅ Blog categories seeded successfully!');
    }
}

