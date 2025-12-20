<?php

use App\Http\Controllers\Api\Admin\AdSlotController as AdminAdSlotController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ProductResourceController as AdminProductResourceController;
use App\Http\Controllers\Api\Admin\StatsController as AdminStatsController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AdSlotController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\JobPostingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductResourceController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/jobs', [JobPostingController::class, 'index']);
Route::get('/jobs/{id}', [JobPostingController::class, 'show']);
Route::get('/jobs/{id}/jsonld', [JobPostingController::class, 'jsonLd']);

// Products (Public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Ad Slots (Public)
Route::get('/ads', [AdSlotController::class, 'index']);

// Stats (Public)
Route::get('/stats', [StatsController::class, 'index']);

// Auth routes
Route::post('/auth/signup', [AuthController::class, 'signup']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Job Postings
    Route::post('/jobs', [JobPostingController::class, 'store']);
    Route::put('/jobs/{id}', [JobPostingController::class, 'update']);
    Route::delete('/jobs/{id}', [JobPostingController::class, 'destroy']);

    // Applications
    Route::post('/jobs/{jobId}/apply', [ApplicationController::class, 'apply']);
    Route::get('/jobs/{jobId}/applications', [ApplicationController::class, 'index']);
    Route::get('/user/applications', [ApplicationController::class, 'myApplications']);

    // Files
    Route::get('/files/cv/{applicationId}', [FileController::class, 'downloadCv']);

    // Payments
    Route::post('/payments/manual-initiate', [PaymentController::class, 'manualInitiate']);
    Route::post('/payments/{transactionId}/upload-proof', [PaymentController::class, 'uploadProof']);

    // User Library
    Route::get('/user/library', [ProductController::class, 'library']);

    // Product Resources (Public - requires access)
    Route::get('/products/{productId}/resources', [ProductResourceController::class, 'index']);
    Route::get('/products/{productId}/resources/{resourceId}/download', [ProductResourceController::class, 'download']);

    // Admin routes - check admin role in controller
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminStatsController::class, 'index']);
        Route::get('/payments/pending', [AdminPaymentController::class, 'pending']);
        Route::post('/payments/{transactionId}/approve', [AdminPaymentController::class, 'approve']);
        Route::post('/payments/{transactionId}/reject', [AdminPaymentController::class, 'reject']);
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
    });
});

