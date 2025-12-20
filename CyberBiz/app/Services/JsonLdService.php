<?php

namespace App\Services;

use App\Models\JobPosting;
use HTMLPurifier;
use HTMLPurifier_Config;

class JsonLdService
{
    private HTMLPurifier $purifier;

    public function __construct()
    {
        $config = HTMLPurifier_Config::createDefault();
        $this->purifier = new HTMLPurifier($config);
    }

    public function generateForJob(JobPosting $job): array
    {
        $employer = $job->employer;

        // Sanitize HTML description
        $sanitizedDescription = $this->purifier->purify($job->description_html);
        // Strip HTML tags for plain text version
        $plainDescription = strip_tags($sanitizedDescription);

        return [
            '@context' => 'https://schema.org/',
            '@type' => 'JobPosting',
            'title' => $job->title,
            'description' => $plainDescription,
            'datePosted' => $job->created_at->format('Y-m-d'),
            'hiringOrganization' => [
                '@type' => 'Organization',
                'name' => $employer->company_name ?? $employer->full_name,
                'logo' => $employer->logo_url ?? null,
            ],
            'employmentType' => 'FULL_TIME', // Default, can be made configurable
            'jobLocation' => [
                '@type' => 'Place',
                'address' => [
                    '@type' => 'PostalAddress',
                    'addressLocality' => 'Addis Ababa', // Default, can be made configurable
                    'addressCountry' => 'ET',
                ],
            ],
            'validThrough' => $job->expires_at?->format('Y-m-d'),
        ];
    }
}

