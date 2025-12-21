<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdSlot;
use App\Models\JobPosting;
use App\Models\Transaction;
use App\Models\User;
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

        // Active jobs (published and not expired)
        $activeJobs = JobPosting::where('status', 'PUBLISHED')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->count();

        // Revenue from approved transactions
        $revenue = Transaction::where('status', 'APPROVED')
            ->sum('amount');

        // Conversion rate (approved transactions / total transactions)
        $totalTransactions = Transaction::count();
        $approvedTransactions = Transaction::where('status', 'APPROVED')->count();
        $conversionRate = $totalTransactions > 0 
            ? round(($approvedTransactions / $totalTransactions) * 100, 1) 
            : 0;

        // Pending payments
        $pendingPayments = Transaction::where('status', 'PENDING_APPROVAL')->count();

        // Active ads
        $activeAds = AdSlot::where('is_active', true)->count();

        // Calculate changes (simplified - can be improved with actual comparison)
        $stats = [
            'total_users' => $totalUsers,
            'total_users_change' => '+12%', // Placeholder - can calculate from historical data
            'active_jobs' => $activeJobs,
            'active_jobs_change' => '+8%', // Placeholder
            'revenue_etb' => (int) $revenue,
            'revenue_change' => '+23%', // Placeholder
            'conversion_rate' => $conversionRate,
            'conversion_rate_change' => '+1.2%', // Placeholder
            'pending_payments' => $pendingPayments,
            'active_ads' => $activeAds,
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}

