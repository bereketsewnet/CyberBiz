<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\SignupRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\PasswordResetRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function signup(SignupRequest $request): JsonResponse
    {
        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'SEEKER',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function googleRedirect()
    {
        if (empty(config('services.google.client_id')) || empty(config('services.google.client_secret'))) {
            return redirect(config('app.frontend_url', 'http://localhost:5173') . '/login?error=' . urlencode('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.'));
        }
        return Socialite::driver('google')->redirect();
    }

    public function googleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::where('email', $googleUser->email)->first();

            if (!$user) {
                // Create new user
                $user = User::create([
                    'full_name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'phone' => $googleUser->phone ?? '', // Google may not provide phone
                    'password' => null, // Social login, no password
                    'email_verified_at' => now(),
                    'role' => 'SEEKER',
                ]);
            } else {
                // Update email verification if not already verified
                if (!$user->email_verified_at) {
                    $user->email_verified_at = now();
                    $user->save();
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/auth/callback?token=' . urlencode($token) . '&provider=google&requires_phone=' . (empty($user->phone) ? '1' : '0'));
        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/login?error=' . urlencode('Google authentication failed: ' . $e->getMessage()));
        }
    }

    public function facebookRedirect()
    {
        if (empty(config('services.facebook.client_id')) || empty(config('services.facebook.client_secret'))) {
            return redirect(config('app.frontend_url', 'http://localhost:5173') . '/login?error=' . urlencode('Facebook OAuth is not configured. Please set FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET in your .env file.'));
        }
        return Socialite::driver('facebook')->redirect();
    }

    public function facebookCallback(Request $request)
    {
        try {
            $facebookUser = Socialite::driver('facebook')->user();

            $user = User::where('email', $facebookUser->email)->first();

            if (!$user) {
                // Create new user
                $user = User::create([
                    'full_name' => $facebookUser->name,
                    'email' => $facebookUser->email,
                    'phone' => '', // Facebook may not provide phone
                    'password' => null, // Social login, no password
                    'email_verified_at' => now(),
                    'role' => 'SEEKER',
                ]);
            } else {
                // Update email verification if not already verified
                if (!$user->email_verified_at) {
                    $user->email_verified_at = now();
                    $user->save();
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/auth/callback?token=' . urlencode($token) . '&provider=facebook&requires_phone=' . (empty($user->phone) ? '1' : '0'));
        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/login?error=' . urlencode('Facebook authentication failed: ' . $e->getMessage()));
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'website_url' => 'nullable|url|max:255',
            'password' => 'sometimes|string|min:8',
        ]);

        // If password is provided, hash it
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => new UserResource($user),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Only allow admin to use forgot password
        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Password reset is only available for administrators. Please contact support.',
            ], 403);
        }

        // Create password reset request for admin notification
        PasswordResetRequest::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'email' => $user->email,
            'status' => 'PENDING',
        ]);

        // Return success message
        return response()->json([
            'message' => 'We notice the admin forgot your password. Your password reset will be processed soon and we will notify you.',
        ]);
    }
}
