<?php

namespace App\Policies;

use App\Models\JobPosting;
use App\Models\User;

class JobPostingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Public can view published jobs
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, JobPosting $jobPosting): bool
    {
        // Public can view published jobs, employers can view their own
        if ($jobPosting->status === 'PUBLISHED') {
            return true;
        }
        
        return $user && ($user->isAdmin() || $jobPosting->employer_id === $user->id);
    }

    /**
     * Determine whether the user can create models.
     * Allow any authenticated user to post jobs (SEEKER, EMPLOYER, LEARNER, ADMIN).
     */
    public function create(User $user): bool
    {
        // Allow any authenticated user to post jobs
        // All roles (SEEKER, EMPLOYER, LEARNER, ADMIN) can create job postings
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, JobPosting $jobPosting): bool
    {
        return $user->isAdmin() || $jobPosting->employer_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, JobPosting $jobPosting): bool
    {
        return $user->isAdmin() || $jobPosting->employer_id === $user->id;
    }
}
