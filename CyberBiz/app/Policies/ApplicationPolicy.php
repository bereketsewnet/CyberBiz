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
            // Check if user owns the job
            return \App\Models\JobPosting::where('id', $jobId)
                ->where('employer_id', $user->id)
                ->exists();
        }
        
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Application $application): bool
    {
        // Seeker can view their own, employer can view for their jobs, admin can view all
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

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isSeeker();
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
