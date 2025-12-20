<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'type' => 'EBOOK',
                'title' => 'Complete Guide to Laravel 12',
                'description' => 'Master Laravel 12 with this comprehensive e-book covering all the latest features, best practices, and real-world examples.',
                'price_etb' => 500.00,
                'access_url' => 'https://example.com/ebooks/laravel-12-guide.pdf',
            ],
            [
                'type' => 'EBOOK',
                'title' => 'React Development Handbook',
                'description' => 'Learn React from scratch with this detailed handbook. Includes hooks, context, and advanced patterns.',
                'price_etb' => 450.00,
                'access_url' => 'https://example.com/ebooks/react-handbook.pdf',
            ],
            [
                'type' => 'COURSE',
                'title' => 'Full Stack Web Development Bootcamp',
                'description' => 'Complete bootcamp covering HTML, CSS, JavaScript, React, Node.js, and databases. Build real projects.',
                'price_etb' => 5000.00,
                'access_url' => 'https://example.com/courses/fullstack-bootcamp',
            ],
            [
                'type' => 'COURSE',
                'title' => 'Digital Marketing Mastery',
                'description' => 'Learn SEO, social media marketing, content marketing, and analytics. Perfect for beginners and intermediate marketers.',
                'price_etb' => 3000.00,
                'access_url' => 'https://example.com/courses/digital-marketing',
            ],
            [
                'type' => 'EBOOK',
                'title' => 'PHP Best Practices',
                'description' => 'A guide to writing clean, maintainable PHP code. Covers design patterns, security, and performance optimization.',
                'price_etb' => 400.00,
                'access_url' => 'https://example.com/ebooks/php-best-practices.pdf',
            ],
            [
                'type' => 'COURSE',
                'title' => 'UI/UX Design Fundamentals',
                'description' => 'Learn the principles of good design, user research, wireframing, and prototyping. Includes hands-on projects.',
                'price_etb' => 3500.00,
                'access_url' => 'https://example.com/courses/ui-ux-design',
            ],
        ];

        foreach ($products as $productData) {
            Product::create($productData);
        }

        $this->command->info('Created ' . count($products) . ' products');
    }
}
