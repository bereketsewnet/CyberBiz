<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\ManualInitiateRequest;
use App\Http\Requests\Payment\UploadProofRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\AffiliateLink;
use App\Models\AffiliateClick;
use App\Models\AffiliateConversion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    public function manualInitiate(ManualInitiateRequest $request): JsonResponse
    {
        $product = Product::findOrFail($request->product_id);

        // Validate amount matches product price
        if ($request->amount != $product->price_etb) {
            return response()->json([
                'message' => 'Amount does not match product price',
            ], 422);
        }

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
            'gateway' => 'MANUAL',
            'amount' => $request->amount,
            'status' => 'PENDING',
        ]);

        // ===== Affiliate tracking: create pending conversion if user came via affiliate link =====
        try {
            $code = $request->cookie('affiliate_code');

            if ($code) {
                $link = AffiliateLink::where('code', $code)->with('program')->first();

                if ($link && $link->is_active && $link->program && $link->program->is_active) {
                    // Avoid duplicate conversions for this transaction
                    $existingConversion = AffiliateConversion::where('transaction_id', $transaction->id)->first();

                    if (!$existingConversion) {
                        $commission = $link->program->calculateCommission($transaction->amount);

                        // Get the most recent click within cookie duration
                        $click = AffiliateClick::where('link_id', $link->id)
                            ->where('clicked_at', '>=', now()->subDays($link->program->cookie_duration ?? 30))
                            ->orderBy('clicked_at', 'desc')
                            ->first();

                        AffiliateConversion::create([
                            'link_id' => $link->id,
                            'click_id' => $click?->id,
                            'transaction_id' => (string) $transaction->id,
                            'amount' => $transaction->amount,
                            'commission' => $commission,
                            'status' => 'pending',
                            'converted_at' => now(),
                        ]);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Affiliate conversion tracking failed during manualInitiate', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Transaction created. Please upload payment proof.',
            'data' => new TransactionResource($transaction->load(['user', 'product'])),
            'instructions' => 'Upload a screenshot or photo of your payment receipt using the upload-proof endpoint.',
        ], 201);
    }

    public function uploadProof(UploadProofRequest $request, string $transactionId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Log the attempt
        error_log("UPLOAD_PROOF: Transaction ID: {$transactionId}, User ID: {$user->id}");

        // Find transaction first
        $transaction = Transaction::find($transactionId);
        
        if (!$transaction) {
            error_log("UPLOAD_PROOF: Transaction not found: {$transactionId}");
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        error_log("UPLOAD_PROOF: Transaction found. Transaction user_id: {$transaction->user_id}, Current user_id: {$user->id}");

        // Compare UUIDs - convert both to strings for comparison
        $transactionUserId = (string)$transaction->user_id;
        $currentUserId = (string)$user->id;
        
        error_log("UPLOAD_PROOF: Comparing '{$transactionUserId}' === '{$currentUserId}': " . ($transactionUserId === $currentUserId ? 'MATCH' : 'NO MATCH'));
        
        if ($transactionUserId !== $currentUserId) {
            error_log("UPLOAD_PROOF: User ID mismatch. Transaction belongs to: {$transactionUserId}, Current user: {$currentUserId}");
            Log::warning('Upload proof - user ID mismatch', [
                'transaction_id' => $transactionId,
                'transaction_user_id' => $transactionUserId,
                'current_user_id' => $currentUserId,
            ]);
            return response()->json(['message' => 'Unauthorized - You do not own this transaction'], 403);
        }

        error_log("UPLOAD_PROOF: User IDs match, proceeding with upload");

        // Check if already uploaded
        if ($transaction->status === 'PENDING_APPROVAL' || $transaction->status === 'APPROVED') {
            return response()->json([
                'message' => 'Proof already uploaded or transaction already processed',
            ], 409);
        }

        // Store proof
        $proofFile = $request->file('proof');
        $proofPath = $proofFile->storeAs(
            'payments/' . $transactionId,
            'proof.' . $proofFile->getClientOriginalExtension(),
            'private'
        );

        $transaction->update([
            'gateway_ref' => $proofPath,
            'status' => 'PENDING_APPROVAL',
        ]);

        return response()->json([
            'message' => 'Payment proof uploaded successfully. Waiting for admin approval.',
            'data' => new TransactionResource($transaction->load(['user', 'product'])),
        ]);
    }
}
