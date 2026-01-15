<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding database with test data...');
        $this->command->newLine();

        $this->call([
            UserSeeder::class,
            SiteSettingsSeeder::class,
            BlogCategorySeeder::class,
            JobPostingSeeder::class,
            ProductSeeder::class,
            ApplicationSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('✅ Database seeding completed!');
        $this->command->newLine();
        $this->command->info('📝 Test Credentials:');
        $this->command->info('   Admin: admin@cyberbiz.africa / password123');
        $this->command->info('   Employer: employer1@cyberbiz.africa / password123');
        $this->command->info('   Seeker: seeker1@cyberbiz.africa / password123');
    }
}
