<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdSlot;
use App\Models\JobPosting;
use App\Models\Transaction;
use App\Models\User;
use App\Models\PasswordResetRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Check authorization
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Total users
        $totalUsers = User::count();
        $totalUsersLastMonth = User::where('created_at', '>=', now()->subMonth())
            ->where('created_at', '<', now()->subMonth()->subMonth())
            ->count();
        $totalUsersThisMonth = User::where('created_at', '>=', now()->subMonth())->count();
        $usersChange = $totalUsersLastMonth > 0 
            ? round((($totalUsersThisMonth - $totalUsersLastMonth) / $totalUsersLastMonth) * 100, 1)
            : ($totalUsersThisMonth > 0 ? 100 : 0);
        $usersChangeFormatted = $usersChange >= 0 ? '+' . $usersChange . '%' : $usersChange . '%';

        // Active jobs - for admin dashboard, show all published jobs (regardless of expiration)
        // This gives admins better visibility of all published content
        $activeJobs = JobPosting::where('status', 'PUBLISHED')->count();
        
        // Jobs currently visible to users (published and not expired)
        $visibleJobs = JobPosting::where('status', 'PUBLISHED')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->count();
        
        // Calculate jobs change (comparing published jobs)
        $jobsLastMonth = JobPosting::where('status', 'PUBLISHED')
            ->where('created_at', '<', now()->subMonth()->subMonth())
            ->count();
        $jobsThisMonth = JobPosting::where('status', 'PUBLISHED')
            ->where('created_at', '>=', now()->subMonth()->subMonth())
            ->where('created_at', '<', now()->subMonth())
            ->count();
        $jobsCurrentMonth = JobPosting::where('status', 'PUBLISHED')
            ->where('created_at', '>=', now()->subMonth())
            ->count();
        $jobsChange = $jobsLastMonth > 0 
            ? round((($jobsCurrentMonth - $jobsLastMonth) / $jobsLastMonth) * 100, 1)
            : ($jobsCurrentMonth > 0 ? 100 : 0);
        $jobsChange = $jobsLastMonth > 0 
            ? round((($jobsThisMonth - $jobsLastMonth) / $jobsLastMonth) * 100, 1)
            : ($jobsThisMonth > 0 ? 100 : 0);
        $jobsChangeFormatted = $jobsChange >= 0 ? '+' . $jobsChange . '%' : $jobsChange . '%';

        // Revenue from approved transactions
        $revenue = Transaction::where('status', 'APPROVED')
            ->sum('amount');
        
        // Revenue change (last month vs this month)
        $revenueLastMonth = Transaction::where('status', 'APPROVED')
            ->where('created_at', '>=', now()->subMonth()->subMonth())
            ->where('created_at', '<', now()->subMonth())
            ->sum('amount');
        $revenueThisMonth = Transaction::where('status', 'APPROVED')
            ->where('created_at', '>=', now()->subMonth())
            ->sum('amount');
        $revenueChange = $revenueLastMonth > 0 
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : ($revenueThisMonth > 0 ? 100 : 0);
        $revenueChangeFormatted = $revenueChange >= 0 ? '+' . $revenueChange . '%' : $revenueChange . '%';

        // Conversion rate (approved transactions / total transactions)
        $totalTransactions = Transaction::count();
        $approvedTransactions = Transaction::where('status', 'APPROVED')->count();
        $conversionRate = $totalTransactions > 0 
            ? round(($approvedTransactions / $totalTransactions) * 100, 1) 
            : 0;

        // Conversion rate change
        $transactionsLastMonth = Transaction::where('created_at', '>=', now()->subMonth()->subMonth())
            ->where('created_at', '<', now()->subMonth())
            ->count();
        $approvedLastMonth = Transaction::where('status', 'APPROVED')
            ->where('created_at', '>=', now()->subMonth()->subMonth())
            ->where('created_at', '<', now()->subMonth())
            ->count();
        $conversionRateLastMonth = $transactionsLastMonth > 0 
            ? round(($approvedLastMonth / $transactionsLastMonth) * 100, 1) 
            : 0;
        $conversionRateChange = $conversionRate - $conversionRateLastMonth;
        $conversionRateChangeFormatted = $conversionRateChange >= 0 ? '+' . $conversionRateChange . '%' : $conversionRateChange . '%';

        // Pending payments
        $pendingPayments = Transaction::where('status', 'PENDING_APPROVAL')->count();

        // Active ads
        $activeAds = AdSlot::where('is_active', true)->count();

        // Pending password reset requests
        $pendingPasswordResets = PasswordResetRequest::where('status', 'PENDING')->count();

        $stats = [
            'total_users' => $totalUsers,
            'total_users_change' => $usersChangeFormatted,
            'active_jobs' => $activeJobs,
            'visible_jobs' => $visibleJobs, // Jobs currently visible to users
            'active_jobs_change' => $jobsChangeFormatted,
            'revenue_etb' => (int) $revenue,
            'revenue_change' => $revenueChangeFormatted,
            'conversion_rate' => $conversionRate,
            'conversion_rate_change' => $conversionRateChangeFormatted,
            'pending_payments' => $pendingPayments,
            'active_ads' => $activeAds,
            'pending_password_resets' => $pendingPasswordResets,
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}

