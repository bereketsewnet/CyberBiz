<?php

namespace Database\Seeders;

use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Database\Seeder;

class JobPostingSeeder extends Seeder
{
    public function run(): void
    {
        $employers = User::where('role', 'EMPLOYER')->get();

        if ($employers->isEmpty()) {
            $this->command->warn('No employers found. Please run UserSeeder first.');
            return;
        }

        $employer1 = $employers->first();
        $employer2 = $employers->skip(1)->first() ?? $employers->first();

        $jobs = [
            [
                'employer_id' => $employer1->id,
                'title' => 'Senior Full Stack Developer',
                'description_html' => '<h2>Job Description</h2><p>We are looking for an experienced Full Stack Developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.</p><h3>Requirements:</h3><ul><li>5+ years of experience in web development</li><li>Proficiency in PHP, Laravel, React, and MySQL</li><li>Strong problem-solving skills</li><li>Excellent communication skills</li></ul><h3>Benefits:</h3><ul><li>Competitive salary</li><li>Health insurance</li><li>Flexible working hours</li></ul>',
                'status' => 'PUBLISHED',
                'expires_at' => now()->addDays(30),
            ],
            [
                'employer_id' => $employer1->id,
                'title' => 'Frontend Developer (React)',
                'description_html' => '<h2>Job Description</h2><p>Join our frontend team and help build amazing user experiences. We are looking for a React developer with a passion for clean code and beautiful interfaces.</p><h3>Requirements:</h3><ul><li>3+ years of React experience</li><li>Knowledge of TypeScript</li><li>Experience with Tailwind CSS</li><li>Portfolio of previous work</li></ul>',
                'status' => 'PUBLISHED',
                'expires_at' => now()->addDays(45),
            ],
            [
                'employer_id' => $employer2->id,
                'title' => 'Digital Marketing Specialist',
                'description_html' => '<h2>Job Description</h2><p>We need a creative Digital Marketing Specialist to manage our online presence and drive customer engagement.</p><h3>Requirements:</h3><ul><li>Bachelor\'s degree in Marketing or related field</li><li>Experience with SEO, SEM, and social media</li><li>Analytical mindset</li><li>Content creation skills</li></ul>',
                'status' => 'PUBLISHED',
                'expires_at' => now()->addDays(20),
            ],
            [
                'employer_id' => $employer1->id,
                'title' => 'Backend Developer (Laravel)',
                'description_html' => '<h2>Job Description</h2><p>Looking for a skilled Laravel developer to build robust backend systems and APIs.</p><h3>Requirements:</h3><ul><li>Strong Laravel framework knowledge</li><li>RESTful API design</li><li>Database optimization</li><li>Testing experience</li></ul>',
                'status' => 'DRAFT',
                'expires_at' => null,
            ],
            [
                'employer_id' => $employer2->id,
                'title' => 'UI/UX Designer',
                'description_html' => '<h2>Job Description</h2><p>Create beautiful and intuitive user interfaces for our digital products.</p><h3>Requirements:</h3><ul><li>Portfolio demonstrating UI/UX skills</li><li>Proficiency in Figma or Adobe XD</li><li>Understanding of user research</li><li>Collaborative mindset</li></ul>',
                'status' => 'PUBLISHED',
                'expires_at' => now()->addDays(15),
            ],
            [
                'employer_id' => $employer1->id,
                'title' => 'DevOps Engineer',
                'description_html' => '<h2>Job Description</h2><p>Manage our infrastructure and deployment pipelines. Help us scale our systems efficiently.</p><h3>Requirements:</h3><ul><li>Experience with Docker and Kubernetes</li><li>CI/CD pipeline setup</li><li>Cloud infrastructure (AWS/Azure)</li><li>Monitoring and logging tools</li></ul>',
                'status' => 'PUBLISHED',
                'expires_at' => now()->addDays(60),
            ],
        ];

        foreach ($jobs as $jobData) {
            $job = JobPosting::create($jobData);
            
            // Generate JSON-LD for published jobs
            if ($job->status === 'PUBLISHED') {
                $jsonLdService = app(\App\Services\JsonLdService::class);
                $job->ld_json = $jsonLdService->generateForJob($job);
                $job->save();
            }
        }

        $this->command->info('Created ' . count($jobs) . ' job postings');
    }
}
