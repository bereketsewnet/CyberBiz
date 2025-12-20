<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdSlot;
use App\Models\JobPosting;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Application;
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

        // Recent activity (last 10 activities)
        $recentActivities = $this->getRecentActivity();

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
            'recent_activities' => $recentActivities,
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }

    private function getRecentActivity(): array
    {
        $activities = [];

        // Get recent users (last 5)
        $recentUsers = User::latest()->limit(5)->get();
        foreach ($recentUsers as $user) {
            $activities[] = [
                'type' => 'user_registered',
                'action' => 'New user registered',
                'user' => $user->full_name,
                'time' => $user->created_at->diffForHumans(),
                'created_at' => $user->created_at->toIso8601String(),
            ];
        }

        // Get recent pending payments
        $recentPayments = Transaction::where('status', 'PENDING_APPROVAL')
            ->with('user', 'product')
            ->latest()
            ->limit(5)
            ->get();
        foreach ($recentPayments as $payment) {
            $activities[] = [
                'type' => 'payment_pending',
                'action' => 'Payment pending approval',
                'user' => $payment->user->full_name ?? 'Unknown',
                'time' => $payment->created_at->diffForHumans(),
                'created_at' => $payment->created_at->toIso8601String(),
            ];
        }

        // Get recent jobs
        $recentJobs = JobPosting::with('employer')
            ->latest()
            ->limit(5)
            ->get();
        foreach ($recentJobs as $job) {
            $activities[] = [
                'type' => 'job_posted',
                'action' => 'New job posted',
                'user' => $job->employer->full_name ?? 'Unknown',
                'time' => $job->created_at->diffForHumans(),
                'created_at' => $job->created_at->toIso8601String(),
            ];
        }

        // Get recent approved transactions (purchases)
        $recentPurchases = Transaction::where('status', 'APPROVED')
            ->with('user', 'product')
            ->latest()
            ->limit(5)
            ->get();
        foreach ($recentPurchases as $purchase) {
            $activities[] = [
                'type' => 'course_purchased',
                'action' => 'Course purchased',
                'user' => $purchase->user->full_name ?? 'Unknown',
                'time' => $purchase->updated_at->diffForHumans(),
                'created_at' => $purchase->updated_at->toIso8601String(),
            ];
        }

        // Sort by created_at desc and limit to 10 most recent
        usort($activities, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return array_slice($activities, 0, 10);
    }
}

