<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\ManualInitiateRequest;
use App\Http\Requests\Payment\UploadProofRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
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

        return response()->json([
            'message' => 'Transaction created. Please upload payment proof.',
            'data' => new TransactionResource($transaction->load(['user', 'product'])),
            'instructions' => 'Upload a screenshot or photo of your payment receipt using the upload-proof endpoint.',
        ], 201);
    }

    public function uploadProof(UploadProofRequest $request, string $transactionId): JsonResponse
    {
        $transaction = Transaction::findOrFail($transactionId);

        // Verify ownership
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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
