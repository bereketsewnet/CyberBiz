<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        try {
            // Get recipient email from .env, default to info@cyberbizafrica.com
            $recipientEmail = env('CONTACT_EMAIL', 'bekwork65@gmail.com');

            // Send email
            Mail::to($recipientEmail)->send(
                new ContactFormMail(
                    $validated['firstName'],
                    $validated['lastName'],
                    $validated['email'],
                    $validated['message']
                )
            );

            return response()->json([
                'message' => 'Message sent successfully! We\'ll get back to you soon.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Contact form email error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to send message. Please try again later or contact us directly.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
