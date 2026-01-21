<?php

use App\Http\Controllers\Api\Admin\AdSlotController as AdminAdSlotController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ProductResourceController as AdminProductResourceController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Admin\StatsController as AdminStatsController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AdSlotController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\JobFavoriteController;
use App\Http\Controllers\Api\JobPostingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductResourceController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BlogCommentController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\NativeAdController;
use App\Http\Controllers\Api\SponsorshipPostController;
use App\Http\Controllers\Api\AffiliateController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/jobs', [JobPostingController::class, 'index']);
Route::get('/jobs/{id}', [JobPostingController::class, 'show']);
Route::get('/jobs/{id}/jsonld', [JobPostingController::class, 'jsonLd']);

// Products (Public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Contact Form (Public)
Route::post('/contact', [ContactController::class, 'send']);

// Ad Slots (Public)
Route::get('/ads', [AdSlotController::class, 'index']);

// Stats (Public)
Route::get('/stats', [StatsController::class, 'index']);

// Settings (Public)
Route::get('/settings', [SettingsController::class, 'index']);

// Blogs (Public)
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);
Route::get('/blogs/categories/all', [BlogController::class, 'categories']);

// Blog Comments (Public read, authenticated write)
Route::get('/blogs/{blogId}/comments', [BlogCommentController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/blogs/{blogId}/comments', [BlogCommentController::class, 'store']);
    Route::put('/comments/{id}', [BlogCommentController::class, 'update']);
    Route::delete('/comments/{id}', [BlogCommentController::class, 'destroy']);
});

// Newsletter (Public subscribe/unsubscribe, Admin management)
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::post('/newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);

// Services (Public)
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);
Route::post('/services/{serviceId}/inquiry', [ServiceController::class, 'submitInquiry']);
Route::post('/services/{serviceId}/inquiry/cancel', [ServiceController::class, 'cancelInquiry']);
Route::post('/services/{serviceId}/inquiry/check', [ServiceController::class, 'checkInquiry']);

// Native Ads (Public)
Route::get('/native-ads', [NativeAdController::class, 'index']);
Route::post('/native-ads/{id}/click', [NativeAdController::class, 'trackClick']);

// Sponsorship Posts (Public)
Route::get('/sponsorship-posts', [SponsorshipPostController::class, 'index']);
Route::get('/sponsorship-posts/{id}', [SponsorshipPostController::class, 'show']);

// Affiliate (Public)
Route::get('/affiliate/programs', [AffiliateController::class, 'programs']);
Route::post('/affiliate/impression/{code}', [AffiliateController::class, 'trackImpression']);
Route::get('/affiliate/click/{code}', [AffiliateController::class, 'trackClick']);
Route::post('/affiliate/conversion', [AffiliateController::class, 'trackConversion']);

// Affiliate (Authenticated)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/affiliate/dashboard', [AffiliateController::class, 'dashboard']);
    Route::post('/affiliate/programs/{programId}/join', [AffiliateController::class, 'joinProgram']);
});

// Auth routes
Route::post('/auth/signup', [AuthController::class, 'signup']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Job Postings
    Route::post('/jobs', [JobPostingController::class, 'store']);
    Route::put('/jobs/{id}', [JobPostingController::class, 'update']);
    Route::delete('/jobs/{id}', [JobPostingController::class, 'destroy']);

    // Applications
    Route::post('/jobs/{jobId}/apply', [ApplicationController::class, 'apply']);
    Route::get('/jobs/{jobId}/applications', [ApplicationController::class, 'index']);
    Route::get('/user/applications', [ApplicationController::class, 'myApplications']);
    Route::get('/jobs/{jobId}/my-application', [ApplicationController::class, 'myJobApplication']);
    Route::delete('/jobs/{jobId}/my-application', [ApplicationController::class, 'deleteMyApplication']);

    // Job Favorites
    Route::post('/jobs/{jobId}/favorite', [JobFavoriteController::class, 'toggle']);
    Route::get('/jobs/{jobId}/favorite', [JobFavoriteController::class, 'check']);
    Route::get('/user/favorites', [JobFavoriteController::class, 'index']);

    // Files
    Route::get('/files/cv/{applicationId}', [FileController::class, 'downloadCv']);

    // Payments
    Route::post('/payments/manual-initiate', [PaymentController::class, 'manualInitiate']);
    Route::post('/payments/{transactionId}/upload-proof', [PaymentController::class, 'uploadProof']);

    // User Library
    Route::get('/user/library', [ProductController::class, 'library']);

    // Product Resources (Public - requires access)
    Route::get('/products/{productId}/resources', [ProductResourceController::class, 'index']);
    Route::get('/products/{productId}/resources/{resourceId}/view', [ProductResourceController::class, 'view']);
    Route::get('/products/{productId}/resources/{resourceId}/download', [ProductResourceController::class, 'download']);
    Route::post('/products/{id}/claim-free', [ProductController::class, 'claimFree']);

    // Admin routes - check admin role in controller
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminStatsController::class, 'index']);
        Route::get('/payments/pending', [AdminPaymentController::class, 'pending']);
        Route::post('/payments/{transactionId}/approve', [AdminPaymentController::class, 'approve']);
        Route::post('/payments/{transactionId}/reject', [AdminPaymentController::class, 'reject']);
        Route::delete('/payments/{transactionId}', [AdminPaymentController::class, 'destroy']);
        Route::get('/files/proof/{transactionId}', [FileController::class, 'downloadProof']);

        // Ad Slots Management
        Route::get('/ads', [AdminAdSlotController::class, 'index']);
        Route::post('/ads', [AdminAdSlotController::class, 'store']);
        Route::get('/ads/{id}', [AdminAdSlotController::class, 'show']);
        Route::put('/ads/{id}', [AdminAdSlotController::class, 'update']);
        Route::post('/ads/{id}/update', [AdminAdSlotController::class, 'update']); // POST endpoint for FormData updates
        Route::delete('/ads/{id}', [AdminAdSlotController::class, 'destroy']);

        // Users Management
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::post('/users/{id}/reset-password', [AdminUserController::class, 'resetPassword']);
        Route::get('/users/password-reset-requests', [AdminUserController::class, 'getPasswordResetRequests']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

        // Products Management
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::get('/products/{id}', [AdminProductController::class, 'show']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::post('/products/{id}/update', [AdminProductController::class, 'update']); // POST endpoint for FormData updates
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);

        // Product Resources Management
        Route::get('/products/{productId}/resources', [AdminProductResourceController::class, 'index']);
        Route::post('/products/{productId}/resources', [AdminProductResourceController::class, 'store']);
        Route::put('/products/{productId}/resources/{resourceId}', [AdminProductResourceController::class, 'update']);
        Route::post('/products/{productId}/resources/{resourceId}/update', [AdminProductResourceController::class, 'update']); // POST endpoint for FormData updates
        Route::post('/products/{productId}/resources/reorder', [AdminProductResourceController::class, 'reorder']);
        Route::delete('/products/{productId}/resources/{resourceId}', [AdminProductResourceController::class, 'destroy']);

        // Jobs Management (using existing JobPostingController but admin-only list)
        Route::get('/jobs', [\App\Http\Controllers\Api\JobPostingController::class, 'index']);

        // Settings Management
        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::put('/settings', [AdminSettingsController::class, 'update']);

        // Blogs Management
        Route::get('/blogs', [BlogController::class, 'adminIndex']); // Admin-specific index that shows all blogs
        Route::get('/blogs/{id}', [BlogController::class, 'adminShow']); // Admin-specific show that shows all blogs including drafts
        Route::post('/blogs', [BlogController::class, 'store']);
        Route::put('/blogs/{id}', [BlogController::class, 'update']);
        Route::post('/blogs/{id}/update', [BlogController::class, 'update']); // POST endpoint for FormData updates
        Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);

        // Newsletter Management
        Route::get('/newsletters', [NewsletterController::class, 'index']);
        Route::post('/newsletters', [NewsletterController::class, 'store']);
        Route::post('/newsletters/{id}/send', [NewsletterController::class, 'send']);
        Route::delete('/newsletters/{id}', [NewsletterController::class, 'destroy']);
        Route::get('/newsletters/subscribers', [NewsletterController::class, 'subscribers']);
        Route::delete('/newsletters/subscribers/{id}', [NewsletterController::class, 'deleteSubscriber']);

        // Services Management
        Route::get('/services', [ServiceController::class, 'adminIndex']);
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{id}', [ServiceController::class, 'update']);
        Route::post('/services/{id}/update', [ServiceController::class, 'update']); // For FormData file uploads
        Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
        Route::get('/services/inquiries', [ServiceController::class, 'inquiries']);
        Route::put('/services/inquiries/{id}', [ServiceController::class, 'updateInquiry']);
        Route::delete('/services/inquiries/{id}', [ServiceController::class, 'deleteInquiry']);

        // Native Ads Management
        Route::get('/native-ads', [NativeAdController::class, 'adminIndex']);
        Route::get('/native-ads/{id}', [NativeAdController::class, 'show']);
        Route::post('/native-ads', [NativeAdController::class, 'store']);
        Route::put('/native-ads/{id}', [NativeAdController::class, 'update']);
        Route::delete('/native-ads/{id}', [NativeAdController::class, 'destroy']);
        Route::post('/native-ads/{id}/reset-stats', [NativeAdController::class, 'resetStats']);

        // Sponsorship Posts Management
        Route::get('/sponsorship-posts', [SponsorshipPostController::class, 'adminIndex']);
        Route::get('/sponsorship-posts/{id}', [SponsorshipPostController::class, 'adminShow']);
        Route::post('/sponsorship-posts', [SponsorshipPostController::class, 'store']);
        Route::put('/sponsorship-posts/{id}', [SponsorshipPostController::class, 'update']);
        Route::delete('/sponsorship-posts/{id}', [SponsorshipPostController::class, 'destroy']);

        // Affiliate Management
        Route::get('/affiliate/programs', [AffiliateController::class, 'adminPrograms']);
        Route::post('/affiliate/programs', [AffiliateController::class, 'createProgram']);
        Route::put('/affiliate/programs/{id}', [AffiliateController::class, 'updateProgram']);
        Route::delete('/affiliate/programs/{id}', [AffiliateController::class, 'deleteProgram']);
        Route::get('/affiliate/links', [AffiliateController::class, 'adminLinks']);
        Route::get('/affiliate/conversions', [AffiliateController::class, 'adminConversions']);
        Route::put('/affiliate/conversions/{id}', [AffiliateController::class, 'updateConversion']);
        Route::get('/affiliate/stats', [AffiliateController::class, 'adminStats']);
    });
});

