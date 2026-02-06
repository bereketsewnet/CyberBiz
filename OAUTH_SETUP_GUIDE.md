# OAuth Integration Guide - Google & Facebook

This guide provides step-by-step instructions for setting up Google and Facebook OAuth authentication in the CyberBiz Africa application.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Google OAuth Setup](#google-oauth-setup)
- [Facebook OAuth Setup](#facebook-oauth-setup)
- [Environment Configuration](#environment-configuration)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Laravel application with Laravel Socialite installed (already included)
- Access to Google Cloud Console
- Access to Facebook Developers Console
- Domain name for production (optional for development)

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `CyberBiz Africa` (or your preferred name)
5. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on **"Google+ API"** and click **"Enable"**
4. Alternatively, enable **"Google Identity Services API"** (newer version)

### Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - Choose **"External"** (unless you have a Google Workspace)
   - Fill in required information:
     - App name: `CyberBiz Africa`
     - User support email: Your email
     - Developer contact: Your email
   - Click **"Save and Continue"**
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (for development)
   - Click **"Save and Continue"** until done

4. Back to Credentials, click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. Select **"Web application"** as the application type
6. Name it: `CyberBiz Africa Web Client`
7. Add **Authorized JavaScript origins**:
   - Development: `http://localhost:8000`
   - Production: `https://yourdomain.com` (replace with your actual domain)
8. Add **Authorized redirect URIs**:
   - Development: `http://localhost:8000/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
9. Click **"Create"**
10. **Copy the Client ID and Client Secret** (you'll need these for `.env`)

### Step 4: Configure Environment Variables

Add to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

For production, update the redirect URI:
```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

---

## Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Consumer"** as the app type
4. Fill in:
   - App Display Name: `CyberBiz Africa`
   - App Contact Email: Your email
5. Click **"Create App"**

### Step 2: Add Facebook Login Product

1. In your app dashboard, find **"Add Products to Your App"**
2. Click **"Set Up"** on **"Facebook Login"**
3. Select **"Web"** as the platform
4. You'll be redirected to the Facebook Login settings

### Step 3: Configure Facebook Login Settings

1. In **"Settings"** → **"Basic"**, note your **App ID** and **App Secret**
2. Go to **"Settings"** → **"Basic"** and add:
   - **App Domains**: `localhost` (for development) or `yourdomain.com` (for production)
   - **Privacy Policy URL**: Your privacy policy URL
   - **Terms of Service URL**: Your terms of service URL
3. Go to **"Facebook Login"** → **"Settings"**
4. Add **Valid OAuth Redirect URIs**:
   - Development: `http://localhost:8000/auth/facebook/callback`
   - Production: `https://yourdomain.com/auth/facebook/callback`
5. Click **"Save Changes"**

### Step 4: Get App ID and App Secret

1. Go to **"Settings"** → **"Basic"**
2. Copy your **App ID** and **App Secret**
   - Note: App Secret is hidden by default, click **"Show"** to reveal it

### Step 5: Configure Environment Variables

Add to your `.env` file:

```env
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:8000/auth/facebook/callback
```

For production, update the redirect URI:
```env
FACEBOOK_REDIRECT_URI=https://yourdomain.com/auth/facebook/callback
```

---

## Environment Configuration

### Complete `.env` Configuration

Add all OAuth-related variables to your `.env` file:

```env
# Application URL
APP_URL=http://localhost:8000
# For production: APP_URL=https://yourdomain.com

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173
# For production: FRONTEND_URL=https://yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=${APP_URL}/auth/google/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
FACEBOOK_REDIRECT_URI=${APP_URL}/auth/facebook/callback
```

### Clear Configuration Cache

After updating `.env`, clear the configuration cache:

```bash
php artisan config:clear
php artisan cache:clear
```

---

## Testing

### Test Google OAuth

1. Start your Laravel server: `php artisan serve`
2. Start your frontend: `npm run dev`
3. Navigate to the login page
4. Click **"Continue with Google"**
5. You should be redirected to Google's login page
6. After authentication, you should be redirected back to your app

### Test Facebook OAuth

1. Navigate to the login page
2. Click **"Continue with Facebook"**
3. You should be redirected to Facebook's login page
4. After authentication, you should be redirected back to your app

### Common Issues During Testing

- **"Missing required parameter: client_id"**: Check that `GOOGLE_CLIENT_ID` is set in `.env`
- **404 Error**: Verify routes are registered: `php artisan route:list --path=auth`
- **Redirect URI mismatch**: Ensure redirect URIs in OAuth providers match exactly with your `.env`

---

## Production Deployment

### Step 1: Update OAuth App Settings

#### Google Cloud Console

1. Go to your OAuth 2.0 Client ID settings
2. Update **Authorized JavaScript origins**:
   - Add: `https://yourdomain.com`
   - Remove: `http://localhost:8000` (optional, keep for testing)
3. Update **Authorized redirect URIs**:
   - Add: `https://yourdomain.com/auth/google/callback`
   - Remove: `http://localhost:8000/auth/google/callback` (optional)

#### Facebook Developers

1. Go to **"Settings"** → **"Basic"**
2. Update **App Domains**: `yourdomain.com`
3. Go to **"Facebook Login"** → **"Settings"**
4. Update **Valid OAuth Redirect URIs**:
   - Add: `https://yourdomain.com/auth/facebook/callback`
   - Remove: `http://localhost:8000/auth/facebook/callback` (optional)

### Step 2: Update Environment Variables

Update your production `.env` file:

```env
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback

FACEBOOK_CLIENT_ID=your_production_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_production_facebook_app_secret
FACEBOOK_REDIRECT_URI=https://yourdomain.com/auth/facebook/callback
```

### Step 3: Submit for Review (Facebook)

For production, Facebook requires app review for certain permissions:

1. Go to **"App Review"** in Facebook Developers
2. Request permissions you need (email, public_profile are usually pre-approved)
3. Submit your app for review
4. While waiting, you can add test users in **"Roles"** → **"Test Users"**

### Step 4: Verify HTTPS

- Ensure your production site uses HTTPS
- OAuth providers require HTTPS for production redirects
- Update all redirect URIs to use `https://`

### Step 5: Clear Cache

After deployment:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

---

## Troubleshooting

### Issue: "Session store not set on request"

**Solution**: OAuth routes are already moved to `web.php` which has session support. If you still see this error, ensure sessions are enabled in your `.env`:

```env
SESSION_DRIVER=database
```

Then run migrations:
```bash
php artisan migrate
```

### Issue: "Missing required parameter: client_id"

**Solution**: 
1. Check that `GOOGLE_CLIENT_ID` or `FACEBOOK_CLIENT_ID` is set in `.env`
2. Run `php artisan config:clear`
3. Restart your server

### Issue: "Redirect URI mismatch"

**Solution**:
1. Ensure redirect URIs in OAuth provider settings match exactly with your `.env`
2. Check for trailing slashes, `http` vs `https`, and port numbers
3. For Google: Check both "Authorized redirect URIs" and "Authorized JavaScript origins"

### Issue: "Invalid OAuth 2.0 Client"

**Solution**:
1. Verify your Client ID and Client Secret are correct
2. Ensure the OAuth consent screen is configured
3. Check that the API is enabled in Google Cloud Console

### Issue: Facebook 404 Error

**Solution**:
1. Verify routes are registered: `php artisan route:list --path=auth`
2. Check that Facebook app is in "Development" mode (for testing)
3. Ensure redirect URI is added in Facebook app settings
4. Clear route cache: `php artisan route:clear`

### Issue: OAuth works but user creation fails

**Solution**:
1. Check database migrations are run: `php artisan migrate`
2. Verify user table structure
3. Check application logs: `storage/logs/laravel.log`

---

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use different OAuth apps** for development and production
3. **Rotate secrets** periodically
4. **Use HTTPS** in production (required by OAuth providers)
5. **Limit OAuth app permissions** to only what's needed
6. **Monitor OAuth usage** in provider dashboards

---

## Additional Resources

- [Laravel Socialite Documentation](https://laravel.com/docs/socialite)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)

---

## Quick Checklist

### Development Setup
- [ ] Google Cloud project created
- [ ] Google OAuth credentials created
- [ ] Google redirect URI configured
- [ ] Facebook app created
- [ ] Facebook Login product added
- [ ] Facebook redirect URI configured
- [ ] Environment variables set in `.env`
- [ ] Configuration cache cleared
- [ ] Tested Google login
- [ ] Tested Facebook login

### Production Setup
- [ ] Production domain configured
- [ ] HTTPS enabled
- [ ] Google OAuth redirect URIs updated
- [ ] Facebook OAuth redirect URIs updated
- [ ] Production environment variables set
- [ ] Facebook app submitted for review (if needed)
- [ ] Configuration cache cleared
- [ ] Tested production OAuth flow

---

**Last Updated**: January 2025
**Version**: 1.0

