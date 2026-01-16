<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, $jobId = null): bool
    {
        // Employers can view applications for their jobs, admins can view all
        if ($user->isAdmin()) {
            return true;
        }
        
        if ($user->isEmployer() && $jobId) {
            // Check if user owns the job - compare UUIDs as strings
            $job = \App\Models\JobPosting::find($jobId);
            if ($job) {
                return (string)$job->employer_id === (string)$user->id;
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Application $application): bool
    {
        // Admin can view all
        if ($user->isAdmin()) {
            return true;
        }
        
        // Allow any user to view their own applications
        if ($application->seeker_id === $user->id) {
            return true;
        }
        
        // Allow any user to view applications for jobs they posted
        if ($application->job->employer_id === $user->id) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     * Allow any authenticated user to apply for jobs.
     */
    public function create(User $user): bool
    {
        // Allow any authenticated user to apply for jobs
        // All roles (SEEKER, EMPLOYER, LEARNER, ADMIN) can create applications
        return true;
    }

    /**
     * Determine whether the user can download CV.
     */
    public function downloadCv(User $user, Application $application): bool
    {
        // Seeker can download their own CV, employer can download for their jobs, admin can download all
        if ($user->isAdmin()) {
            return true;
        }
        
        if ($user->isSeeker() && $application->seeker_id === $user->id) {
            return true;
        }
        
        if ($user->isEmployer() && $application->job->employer_id === $user->id) {
            return true;
        }
        
        return false;
    }
}
