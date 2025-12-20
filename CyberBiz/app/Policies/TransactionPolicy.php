<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // Users can view their own, admins can view all
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin() || $transaction->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // Any authenticated user can create transactions
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Transaction $transaction): bool
    {
        // Only admins can approve/reject, users can upload proof
        if ($user->isAdmin()) {
            return true;
        }
        
        // Users can upload proof for their own pending transactions
        return $transaction->user_id === $user->id 
            && in_array($transaction->status, ['PENDING', 'PENDING_APPROVAL']);
    }

    /**
     * Determine whether the user can approve transactions.
     */
    public function approve(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can reject transactions.
     */
    public function reject(User $user): bool
    {
        return $user->isAdmin();
    }
}
