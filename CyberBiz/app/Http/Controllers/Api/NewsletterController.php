<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewsletterMail;
use App\Models\Newsletter;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    /**
     * Subscribe to newsletter (public)
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $email = strtolower(trim($data['email']));

        // Check if already subscribed
        $subscriber = NewsletterSubscriber::where('email', $email)->first();

        if ($subscriber) {
            if ($subscriber->isSubscribed()) {
                return response()->json([
                    'message' => 'Email is already subscribed',
                ], 409);
            } else {
                // Resubscribe
                $subscriber->update([
                    'status' => 'subscribed',
                    'name' => $data['name'] ?? $subscriber->name,
                    'subscribed_at' => now(),
                    'unsubscribed_at' => null,
                ]);

                return response()->json([
                    'message' => 'Successfully resubscribed to newsletter',
                ]);
            }
        }

        // Create new subscriber
        NewsletterSubscriber::create([
            'email' => $email,
            'name' => $data['name'] ?? null,
            'status' => 'subscribed',
            'subscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Successfully subscribed to newsletter',
        ], 201);
    }

    /**
     * Unsubscribe from newsletter (public)
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $subscriber = NewsletterSubscriber::where('email', $email)->first();

        if (!$subscriber) {
            return response()->json([
                'message' => 'Email not found in our newsletter list',
            ], 404);
        }

        if (!$subscriber->isSubscribed()) {
            return response()->json([
                'message' => 'Email is already unsubscribed',
            ]);
        }

        $subscriber->update([
            'status' => 'unsubscribed',
            'unsubscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Successfully unsubscribed from newsletter',
        ]);
    }

    /**
     * Get all subscribers (admin only)
     */
    public function subscribers(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = NewsletterSubscriber::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('q') && $request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('email', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('name', 'LIKE', '%' . $request->q . '%');
            });
        }

        $perPage = $request->get('per_page', 15);
        $subscribers = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $subscribers->items(),
            'meta' => [
                'current_page' => $subscribers->currentPage(),
                'last_page' => $subscribers->lastPage(),
                'per_page' => $subscribers->perPage(),
                'total' => $subscribers->total(),
            ],
        ]);
    }

    /**
     * Get all newsletters (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $newsletters = Newsletter::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'data' => $newsletters->items(),
            'meta' => [
                'current_page' => $newsletters->currentPage(),
                'last_page' => $newsletters->lastPage(),
                'per_page' => $newsletters->perPage(),
                'total' => $newsletters->total(),
            ],
        ]);
    }

    /**
     * Create a newsletter (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $newsletter = Newsletter::create([
            'subject' => $request->subject,
            'content' => $request->content,
            'created_by' => $request->user()->id,
        ]);

        $newsletter->load('creator');

        return response()->json([
            'message' => 'Newsletter created successfully',
            'data' => $newsletter,
        ], 201);
    }

    /**
     * Send a newsletter (admin only)
     */
    public function send(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $newsletter = Newsletter::findOrFail($id);

        if ($newsletter->isSent()) {
            return response()->json([
                'message' => 'Newsletter has already been sent',
            ], 422);
        }

        // Get subscribers - either selected ones or all subscribed
        $validator = Validator::make($request->all(), [
            'subscriber_ids' => 'nullable|array',
            'subscriber_ids.*' => 'integer|exists:newsletter_subscribers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        
        if (isset($validated['subscriber_ids']) && !empty($validated['subscriber_ids'])) {
            // Send to selected subscribers
            $subscribers = NewsletterSubscriber::whereIn('id', $validated['subscriber_ids'])
                ->where('status', 'subscribed')
                ->get();
        } else {
            // Send to all subscribed subscribers
            $subscribers = NewsletterSubscriber::where('status', 'subscribed')->get();
        }

        if ($subscribers->isEmpty()) {
            return response()->json([
                'message' => 'No subscribers found',
            ], 422);
        }

        $sentCount = 0;
        $failedCount = 0;

        // Send email to each subscriber
        foreach ($subscribers as $subscriber) {
            try {
                Mail::to($subscriber->email)->send(
                    new NewsletterMail($newsletter->subject, $newsletter->content)
                );
                $sentCount++;
            } catch (\Exception $e) {
                Log::error('Newsletter email error for ' . $subscriber->email . ': ' . $e->getMessage());
                $failedCount++;
            }
        }

        // Update newsletter as sent
        $newsletter->update([
            'sent_at' => now(),
            'recipient_count' => $sentCount,
        ]);

        return response()->json([
            'message' => 'Newsletter sent successfully',
            'data' => [
                'recipient_count' => $sentCount,
                'failed_count' => $failedCount,
            ],
        ]);
    }

    /**
     * Delete a subscriber (admin only)
     */
    public function deleteSubscriber(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscriber = NewsletterSubscriber::findOrFail($id);
        $subscriber->delete();

        return response()->json([
            'message' => 'Subscriber deleted successfully',
        ]);
    }

    /**
     * Delete a newsletter (admin only)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $newsletter = Newsletter::findOrFail($id);
        $newsletter->delete();

        return response()->json([
            'message' => 'Newsletter deleted successfully',
        ]);
    }
}
