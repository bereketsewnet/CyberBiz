<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function downloadCv(Request $request, string $applicationId)
    {
        $application = Application::with('job')->findOrFail($applicationId);

        // Check authorization
        if (!$request->user()->can('downloadCv', $application)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if file exists
        if (!Storage::disk('private')->exists($application->cv_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $file = Storage::disk('private')->get($application->cv_path);
        $mimeType = Storage::disk('private')->mimeType($application->cv_path);

        return response()->streamDownload(function () use ($file) {
            echo $file;
        }, $application->cv_original_name, [
            'Content-Type' => $mimeType,
        ]);
    }

    public function downloadProof(Request $request, string $transactionId)
    {
        // Only admin can download payment proofs
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction = \App\Models\Transaction::findOrFail($transactionId);

        if (!$transaction->gateway_ref) {
            return response()->json(['message' => 'Proof not found'], 404);
        }

        if (!Storage::disk('private')->exists($transaction->gateway_ref)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $file = Storage::disk('private')->get($transaction->gateway_ref);
        $mimeType = Storage::disk('private')->mimeType($transaction->gateway_ref);
        $filename = basename($transaction->gateway_ref);

        return response()->streamDownload(function () use ($file) {
            echo $file;
        }, $filename, [
            'Content-Type' => $mimeType,
        ]);
    }
}
