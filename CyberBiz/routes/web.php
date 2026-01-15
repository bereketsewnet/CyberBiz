<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// OAuth routes - require sessions for Socialite
Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);
Route::get('/auth/facebook/redirect', [AuthController::class, 'facebookRedirect']);
Route::get('/auth/facebook/callback', [AuthController::class, 'facebookCallback']);
