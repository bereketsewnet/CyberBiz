<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AffiliateProgram;
use App\Models\AffiliateLink;
use App\Models\AffiliateClick;
use App\Models\AffiliateConversion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AffiliateController extends Controller
{
    /**
     * Track click on affiliate link (public)
     */
    public function trackClick(Request $request, string $code): JsonResponse
    {
        $link = AffiliateLink::where('code', $code)
            ->where('is_active', true)
            ->with('program')
            ->first();

        if (!$link || !$link->program->is_active) {
            return response()->json(['message' => 'Invalid affiliate link'], 404);
        }

        // Create click record
        $click = AffiliateClick::create([
            'link_id' => $link->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referer' => $request->header('Referer'),
            'country' => $this->getCountryFromIp($request->ip()),
            'clicked_at' => now(),
        ]);

        // Set cookie for conversion tracking
        $cookieDuration = $link->program->cookie_duration ?? 30;

        return response()
            ->json([
                'message' => 'Click tracked',
                'redirect_url' => $link->program->target_url,
                'link_id' => $link->id,
            ])
            ->cookie('affiliate_code', $code, $cookieDuration * 24 * 60); // Cookie in minutes
    }

    /**
     * Register conversion (can be called via API/webhook)
     */
    public function trackConversion(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'transaction_id' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'affiliate_code' => 'nullable|string|exists:affiliate_links,code',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $code = $request->affiliate_code ?? $request->cookie('affiliate_code');

        if (!$code) {
            return response()->json(['message' => 'No affiliate code found'], 400);
        }

        $link = AffiliateLink::where('code', $code)->with('program')->first();

        if (!$link || !$link->is_active || !$link->program->is_active) {
            return response()->json(['message' => 'Invalid affiliate link'], 404);
        }

        // Check if conversion already exists
        $existingConversion = AffiliateConversion::where('transaction_id', $request->transaction_id)->first();
        if ($existingConversion) {
            return response()->json(['message' => 'Conversion already tracked'], 400);
        }

        // Calculate commission
        $commission = $link->program->calculateCommission($request->amount);

        // Get recent click (within cookie duration)
        $click = AffiliateClick::where('link_id', $link->id)
            ->where('clicked_at', '>=', now()->subDays($link->program->cookie_duration))
            ->orderBy('clicked_at', 'desc')
            ->first();

        $conversion = AffiliateConversion::create([
            'link_id' => $link->id,
            'click_id' => $click?->id,
            'transaction_id' => $request->transaction_id,
            'amount' => $request->amount,
            'commission' => $commission,
            'status' => 'pending',
            'converted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Conversion tracked successfully',
            'data' => $conversion,
        ], 201);
    }

    /**
     * Get affiliate programs (public - for affiliates to see available programs)
     */
    public function programs(Request $request): JsonResponse
    {
        $programs = AffiliateProgram::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $programs,
        ]);
    }

    /**
     * Get affiliate dashboard stats (authenticated affiliate)
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $links = AffiliateLink::where('affiliate_id', $user->id)
            ->with(['program', 'clicks', 'conversions'])
            ->get();

        $stats = [
            'total_links' => $links->count(),
            'total_clicks' => $links->sum(fn($link) => $link->clicks->count()),
            'total_conversions' => $links->sum(fn($link) => $link->conversions->where('status', '!=', 'rejected')->count()),
            'total_commission' => $links->sum(fn($link) => $link->conversions->where('status', '!=', 'rejected')->sum('commission')),
            'pending_commission' => $links->sum(fn($link) => $link->conversions->where('status', 'pending')->sum('commission')),
            'paid_commission' => $links->sum(fn($link) => $link->conversions->where('status', 'paid')->sum('commission')),
        ];

        return response()->json([
            'data' => [
                'links' => $links,
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * Join an affiliate program (authenticated user)
     */
    public function joinProgram(Request $request, string $programId): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $program = AffiliateProgram::findOrFail($programId);

        if (!$program->is_active) {
            return response()->json(['message' => 'Program is not active'], 400);
        }

        // Check if already joined
        $existingLink = AffiliateLink::where('program_id', $program->id)
            ->where('affiliate_id', $user->id)
            ->first();

        if ($existingLink) {
            return response()->json([
                'message' => 'Already joined this program',
                'data' => $existingLink,
            ]);
        }

        // Create affiliate link
        $link = AffiliateLink::create([
            'program_id' => $program->id,
            'affiliate_id' => $user->id,
            'code' => \Illuminate\Support\Str::random(10),
            'is_active' => true,
        ]);

        $link->url = $link->generateUrl();
        $link->save();

        return response()->json([
            'message' => 'Successfully joined affiliate program',
            'data' => $link->load('program'),
        ], 201);
    }

    // ========== ADMIN METHODS ==========

    /**
     * Get all affiliate programs (admin)
     */
    public function adminPrograms(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $programs = AffiliateProgram::withCount(['links', 'links as active_links_count' => function ($query) {
            $query->where('is_active', true);
        }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $programs,
        ]);
    }

    /**
     * Create affiliate program (admin)
     */
    public function createProgram(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed',
            'commission_rate' => 'required|numeric|min:0',
            'target_url' => 'required|url|max:255',
            'is_active' => 'nullable|boolean',
            'cookie_duration' => 'nullable|integer|min:1|max:365',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $program = AffiliateProgram::create($validator->validated());

        return response()->json([
            'message' => 'Affiliate program created successfully',
            'data' => $program,
        ], 201);
    }

    /**
     * Update affiliate program (admin)
     */
    public function updateProgram(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $program = AffiliateProgram::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:percentage,fixed',
            'commission_rate' => 'sometimes|required|numeric|min:0',
            'target_url' => 'sometimes|required|url|max:255',
            'is_active' => 'nullable|boolean',
            'cookie_duration' => 'nullable|integer|min:1|max:365',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $program->update($validator->validated());

        return response()->json([
            'message' => 'Affiliate program updated successfully',
            'data' => $program,
        ]);
    }

    /**
     * Delete affiliate program (admin)
     */
    public function deleteProgram(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $program = AffiliateProgram::findOrFail($id);
        $program->delete();

        return response()->json([
            'message' => 'Affiliate program deleted successfully',
        ]);
    }

    /**
     * Get all affiliate links (admin)
     */
    public function adminLinks(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = AffiliateLink::with(['program', 'affiliate']);

        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->has('affiliate_id')) {
            $query->where('affiliate_id', $request->affiliate_id);
        }

        $links = $query->withCount(['clicks', 'conversions'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'data' => $links->items(),
            'meta' => [
                'current_page' => $links->currentPage(),
                'last_page' => $links->lastPage(),
                'per_page' => $links->perPage(),
                'total' => $links->total(),
            ],
        ]);
    }

    /**
     * Get all conversions (admin)
     */
    public function adminConversions(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = AffiliateConversion::with(['link.program', 'link.affiliate']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('link_id')) {
            $query->where('link_id', $request->link_id);
        }

        $conversions = $query->orderBy('converted_at', 'desc')
            ->paginate(15);

        return response()->json([
            'data' => $conversions->items(),
            'meta' => [
                'current_page' => $conversions->currentPage(),
                'last_page' => $conversions->lastPage(),
                'per_page' => $conversions->perPage(),
                'total' => $conversions->total(),
            ],
        ]);
    }

    /**
     * Update conversion status (admin)
     */
    public function updateConversion(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversion = AffiliateConversion::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,paid,rejected',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $conversion->update($validator->validated());

        return response()->json([
            'message' => 'Conversion status updated successfully',
            'data' => $conversion->load(['link.program', 'link.affiliate']),
        ]);
    }

    /**
     * Get stats overview (admin)
     */
    public function adminStats(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = [
            'total_programs' => AffiliateProgram::count(),
            'active_programs' => AffiliateProgram::where('is_active', true)->count(),
            'total_links' => AffiliateLink::count(),
            'active_links' => AffiliateLink::where('is_active', true)->count(),
            'total_clicks' => AffiliateClick::count(),
            'total_conversions' => AffiliateConversion::count(),
            'total_commission' => AffiliateConversion::where('status', '!=', 'rejected')->sum('commission'),
            'pending_commission' => AffiliateConversion::where('status', 'pending')->sum('commission'),
            'paid_commission' => AffiliateConversion::where('status', 'paid')->sum('commission'),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * Helper method to get country from IP (simplified - in production use a proper service)
     */
    private function getCountryFromIp(string $ip): ?string
    {
        // Simplified - in production, use a service like MaxMind GeoIP
        return null;
    }
}
