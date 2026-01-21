<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApprovePaymentRequest;
use App\Http\Requests\Admin\RejectPaymentRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\UserLibrary;
use App\Models\AffiliateConversion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Authorization is checked in each method
    }

    public function pending(Request $request): JsonResponse
    {
        // Check authorization
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Allow optional status filter; if not provided or set to ALL, return full history
        $query = Transaction::with(['user', 'product'])->latest();

        $status = $request->get('status');
        if ($status && $status !== 'ALL') {
            $query->where('status', $status);
        }

        $transactions = $query->paginate(15);

        return response()->json([
            'data' => TransactionResource::collection($transactions),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function approve(ApprovePaymentRequest $request, string $transactionId): JsonResponse
    {
        // Check authorization
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction = Transaction::findOrFail($transactionId);

        if ($transaction->status !== 'PENDING_APPROVAL') {
            return response()->json([
                'message' => 'Transaction is not pending approval',
            ], 422);
        }

        DB::transaction(function () use ($transaction) {
            $transaction->update(['status' => 'APPROVED']);

            // Grant access to product
            if ($transaction->product_id) {
                UserLibrary::firstOrCreate([
                    'user_id' => $transaction->user_id,
                    'product_id' => $transaction->product_id,
                ], [
                    'access_granted_at' => now(),
                ]);
            }

            // If there is an affiliate conversion for this transaction, mark it as approved
            $conversion = AffiliateConversion::where('transaction_id', (string) $transaction->id)
                ->where('status', 'pending')
                ->first();

            if ($conversion) {
                $conversion->update([
                    'status' => 'approved',
                ]);
            }
        });

        // TODO: Send receipt email

        return response()->json([
            'message' => 'Payment approved and access granted',
            'data' => new TransactionResource($transaction->load(['user', 'product'])),
        ]);
    }

    public function reject(RejectPaymentRequest $request, string $transactionId): JsonResponse
    {
        // Check authorization
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction = Transaction::findOrFail($transactionId);

        if ($transaction->status !== 'PENDING_APPROVAL') {
            return response()->json([
                'message' => 'Transaction is not pending approval',
            ], 422);
        }

        $transaction->update([
            'status' => 'REJECTED',
            'meta' => array_merge($transaction->meta ?? [], [
                'rejection_reason' => $request->reason,
                'rejected_at' => now(),
                'rejected_by' => $request->user()->id,
            ]),
        ]);

        // TODO: Send rejection email

        return response()->json([
            'message' => 'Payment rejected',
            'data' => new TransactionResource($transaction->load(['user', 'product'])),
        ]);
    }

    public function destroy(Request $request, string $transactionId): JsonResponse
    {
        // Check authorization
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction = Transaction::findOrFail($transactionId);

        // Delete related affiliate conversion if exists
        AffiliateConversion::where('transaction_id', (string) $transaction->id)->delete();

        // Delete user library entry if exists
        if ($transaction->product_id) {
            UserLibrary::where('user_id', $transaction->user_id)
                ->where('product_id', $transaction->product_id)
                ->delete();
        }

        // Delete payment proof file if exists
        if ($transaction->gateway_ref) {
            try {
                $proofPath = 'proofs/' . $transaction->gateway_ref;
                if (Storage::disk('private')->exists($proofPath)) {
                    Storage::disk('private')->delete($proofPath);
                }
            } catch (\Exception $e) {
                // Log error but continue with deletion
                \Log::warning('Failed to delete payment proof file', [
                    'transaction_id' => $transaction->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Delete the transaction
        $transaction->delete();

        return response()->json([
            'message' => 'Transaction deleted successfully',
        ]);
    }
}
