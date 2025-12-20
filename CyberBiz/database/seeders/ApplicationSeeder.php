<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Database\Seeder;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $seekers = User::where('role', 'SEEKER')->get();
        $publishedJobs = JobPosting::where('status', 'PUBLISHED')->get();

        if ($seekers->isEmpty() || $publishedJobs->isEmpty()) {
            $this->command->warn('No seekers or published jobs found. Please run UserSeeder and JobPostingSeeder first.');
            return;
        }

        $seeker1 = $seekers->first();
        $seeker2 = $seekers->skip(1)->first() ?? $seekers->first();

        // Create some sample applications
        $applications = [
            [
                'job_id' => $publishedJobs->first()->id,
                'seeker_id' => $seeker1->id,
                'cv_path' => 'cvs/sample_cv_1.pdf',
                'cv_original_name' => 'Alem_Seeker_CV.pdf',
                'cover_letter' => 'I am very interested in this position and believe my skills align perfectly with your requirements. I have 5 years of experience in web development and am excited about the opportunity to contribute to your team.',
            ],
            [
                'job_id' => $publishedJobs->skip(1)->first()->id ?? $publishedJobs->first()->id,
                'seeker_id' => $seeker1->id,
                'cv_path' => 'cvs/sample_cv_1.pdf',
                'cv_original_name' => 'Alem_Seeker_CV.pdf',
                'cover_letter' => 'I am writing to express my interest in the Frontend Developer position. I have extensive experience with React and would love to bring my skills to your team.',
            ],
            [
                'job_id' => $publishedJobs->first()->id,
                'seeker_id' => $seeker2->id,
                'cv_path' => 'cvs/sample_cv_2.pdf',
                'cv_original_name' => 'Meron_Job_Seeker_CV.pdf',
                'cover_letter' => 'I am excited to apply for this role. My background in software development and passion for technology make me a great fit for your organization.',
            ],
        ];

        foreach ($applications as $applicationData) {
            // Check if application already exists
            $exists = Application::where('job_id', $applicationData['job_id'])
                ->where('seeker_id', $applicationData['seeker_id'])
                ->exists();

            if (!$exists) {
                Application::create($applicationData);
            }
        }

        $this->command->info('Created sample applications');
    }
}
