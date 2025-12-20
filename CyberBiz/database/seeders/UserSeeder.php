<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin User
        $admin = User::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'full_name' => 'Admin User',
            'email' => 'admin@cyberbiz.africa',
            'phone' => '+251911000001',
            'password' => Hash::make('password123'),
            'role' => 'ADMIN',
            'subscription_tier' => 'FREE',
            'credits' => 1000,
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        // Employer Users
        $employer1 = User::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'full_name' => 'John Employer',
            'email' => 'employer1@cyberbiz.africa',
            'phone' => '+251911000002',
            'password' => Hash::make('password123'),
            'role' => 'EMPLOYER',
            'subscription_tier' => 'PRO_EMPLOYER',
            'credits' => 50,
            'company_name' => 'Tech Solutions Ethiopia',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        $employer2 = User::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'full_name' => 'Sarah Business',
            'email' => 'employer2@cyberbiz.africa',
            'phone' => '+251911000003',
            'password' => Hash::make('password123'),
            'role' => 'EMPLOYER',
            'subscription_tier' => 'FREE',
            'credits' => 10,
            'company_name' => 'Digital Marketing Agency',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        // Seeker Users
        $seeker1 = User::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'full_name' => 'Alem Seeker',
            'email' => 'seeker1@cyberbiz.africa',
            'phone' => '+251911000004',
            'password' => Hash::make('password123'),
            'role' => 'SEEKER',
            'subscription_tier' => 'FREE',
            'credits' => 0,
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        $seeker2 = User::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'full_name' => 'Meron Job Seeker',
            'email' => 'seeker2@cyberbiz.africa',
            'phone' => '+251911000005',
            'password' => Hash::make('password123'),
            'role' => 'SEEKER',
            'subscription_tier' => 'FREE',
            'credits' => 0,
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        // Learner User
        $learner = User::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'full_name' => 'David Learner',
            'email' => 'learner@cyberbiz.africa',
            'phone' => '+251911000006',
            'password' => Hash::make('password123'),
            'role' => 'LEARNER',
            'subscription_tier' => 'FREE',
            'credits' => 0,
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        $this->command->info('Created users:');
        $this->command->info('- Admin: admin@cyberbiz.africa / password123');
        $this->command->info('- Employer 1: employer1@cyberbiz.africa / password123');
        $this->command->info('- Employer 2: employer2@cyberbiz.africa / password123');
        $this->command->info('- Seeker 1: seeker1@cyberbiz.africa / password123');
        $this->command->info('- Seeker 2: seeker2@cyberbiz.africa / password123');
        $this->command->info('- Learner: learner@cyberbiz.africa / password123');
    }
}
