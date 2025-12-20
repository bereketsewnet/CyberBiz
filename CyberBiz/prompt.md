# CyberBiz Africa — Backend System Prompt (Laravel 12 / MySQL / cPanel)

> **Purpose:** Developer-ready backend system prompt derived from the uploaded PDF and your overrides. This file describes exactly what to implement for the Laravel 12 backend, using MySQL on cPanel, local (cPanel) storage, Google sign-in, phone+email, manual payment flow (screenshot + admin approval), UUID primary keys, and returning job JSON-LD in job payloads.

---

## Short goal

Build the CyberBiz Africa backend with **Laravel 12**, **MySQL** (cPanel), and **local storage** (cPanel). Expose secure JSON REST APIs consumed by a Vite React + TypeScript + Tailwind frontend (frontend delivered later). Support Google sign-in (plus phone and email), manual payments (upload screenshot and admin approval), and include job JSON-LD (`ld_json`) in job responses.

## High-level constraints & choices

* PHP 8.2+, Laravel 12.
* Database: MySQL (InnoDB) on cPanel.
* Storage: **Local (cPanel) private storage**. Files stored under `storage/app/private/` and served through secure controller endpoints.
* Auth: **Laravel Sanctum** for token-based API auth, plus Google OAuth using Laravel Socialite.
* IDs: **UUID v4** for primary keys (users, jobs, transactions, etc.).
* Queue driver: `database` (suitable for cPanel shared hosting). Redis optional if later available.
* Cron: set cPanel cron to run `php /home/<user>/path/artisan schedule:run` every minute.

## Chosen API domain

* Default API base URL: `https://api.cyberbiz.africa` (replace with your real domain in production). Use this in `APP_URL` and `SANCTUM_STATEFUL_DOMAINS`.

---

## Environment variables (.env examples)

```env
APP_NAME=CyberBizAfrica
APP_ENV=production
APP_KEY=base64:...
APP_URL=https://api.cyberbiz.africa

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cyberbiz
DB_USERNAME=...
DB_PASSWORD=...

FILESYSTEM_DRIVER=local
PRIVATE_FILES_DISK=private

SANCTUM_STATEFUL_DOMAINS=api.cyberbiz.africa
SESSION_DOMAIN=.cyberbiz.africa
QUEUE_CONNECTION=database

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT=https://api.cyberbiz.africa/auth/google/callback

MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=hello@cyberbiz.africa
```

**Filesystems config:** Add a `private` disk in `config/filesystems.php`:

```php
'private' => [
  'driver' => 'local',
  'root' => storage_path('app/private'),
  'visibility' => 'private',
],
```

Make sure `storage/app/private` exists and is not web-accessible.

---

## Database schema (core tables — summary)

Use UUID primary keys for the following tables where noted.

**users** (uuid)

* id (uuid)
* full_name, email, phone (phone required), password (nullable for social)
* role ENUM: `ADMIN`, `EMPLOYER`, `SEEKER`, `LEARNER`
* email_verified_at, phone_verified_at (nullable)
* subscription_tier, credits, company_name
* timestamps, softDeletes

**jobs** (uuid)

* id (uuid), employer_id (uuid FK -> users)
* title, description_html (longText)
* status ENUM: `DRAFT`,`PUBLISHED`,`ARCHIVED`
* expires_at (nullable)
* ld_json (json nullable) — optional precomputed JSON-LD
* fulltext index on (title, description_html)

**applications** (uuid)

* id (uuid), job_id (uuid), seeker_id (uuid)
* cv_path, cv_original_name
* cover_letter (nullable)
* timestamps

**products** (uuid)

* id, type ENUM(`COURSE`,`EBOOK`), title, price_etb, access_url

**transactions** (uuid)

* id, user_id, product_id nullable
* gateway ENUM: `MANUAL` (now), later `CHAPA`,`SANTIM`
* gateway_ref (string) — for manual store screenshot filename or future ref
* amount decimal, status ENUM: `PENDING`,`PENDING_APPROVAL`,`APPROVED`,`REJECTED` (use `PENDING_APPROVAL` after screenshot upload)
* meta JSON nullable
* timestamps

**user_library** (id)

* id, user_id, product_id, access_granted_at

Add pivot or extra tables as needed (ad_slots, blog_posts, payment_logs).

---

## Core relationships and models

* `User` (uuid) — hasMany Jobs (if employer), Applications, Transactions.
* `Job` — belongsTo `User`, hasMany `Application`.
* `Application` — belongsTo `Job`, belongsTo `User`.
* `Transaction` — belongsTo `User`, belongsTo `Product`.

Implement corresponding Eloquent models, factories, and policies.

---

## Routes & API endpoints (minimal set)

All routes under `/api` and return JSON. Use API resources and request validation.

### Auth

* `POST /api/auth/signup` — {full_name, email, phone, password} → registers and returns token.
* `POST /api/auth/login` — email + password → token.
* `GET /api/auth/user` — current user (Sanctum).
* `GET /api/auth/google/redirect` — redirect to Google OAuth.
* `GET /api/auth/google/callback` — callback; create/find user, attach phone if returned or ask to provide phone; return token.
* `POST /api/auth/verify-phone` — send/verify OTP (if you want phone verification).

### Jobs

* `GET /api/jobs?q=` — public search & list (pagination, filters).
* `GET /api/jobs/{id}` — returns job resource with `ld_json` field (string or json).
* `POST /api/jobs` — employer-only create.
* `PUT /api/jobs/{id}`, `DELETE /api/jobs/{id}` — employer/admin.
* `GET /api/jobs/{id}/jsonld` — `application/ld+json` response for the job (optional).

### Applications

* `POST /api/jobs/{id}/apply` — requires auth (seeker). Accepts `cv` file (pdf/docx ≤5MB) and optional cover letter.
* `GET /api/jobs/{id}/applications` — employer-only list.

### Files

* `GET /api/files/cv/{application_id}` — returns a signed URL or streams the file after policy check (employer who owns job or seeker who uploaded).
* `GET /api/files/preview/{path}` — (admin only) stream or download.

### Products & Purchases (manual flow)

* `POST /api/payments/manual-initiate` — {user_id, product_id, amount} — create `transactions` row with `gateway=MANUAL`, `status=PENDING`. Return `transaction_id` and instructions.
* `POST /api/payments/{transaction_id}/upload-proof` — multipart/form upload `screenshot` (image/pdf) — store in `storage/app/private/payments/{transaction_id}/proof.ext`, update transaction `gateway_ref` to stored path and set `status=PENDING_APPROVAL`.
* `GET /api/admin/payments/pending` — admin-only list pending approvals.
* `POST /api/admin/payments/{transaction_id}/approve` — mark `APPROVED`, create `user_library` entry and send receipt.
* `POST /api/admin/payments/{transaction_id}/reject` — mark `REJECTED` with reason.

This manual flow allows production to proceed before real gateway credentials exist.

---

## File handling (local cPanel storage)

* Accept only `pdf` and `docx` for CVs; for payment proofs allow `jpg,jpeg,png,pdf` up to 5MB.
* Store all private files in `storage/app/private/...`.
* Implement a `PrivateFileController::stream($path)` method that:

  1. Validates the requesting user via policies.
  2. Uses `Storage::disk('private')->exists($path)` and `Storage::disk('private')->get()`.
  3. Streams file using `response()->streamDownload()` with proper `Content-Type` and `Content-Disposition`.
* Ensure the `public_html` (or `public`) directory has no direct access to `storage/app/private`.

---

## Validation rules (examples)

**ApplyRequest**:

```php
'cv' => 'required|file|mimes:pdf,docx|max:5120'
```

**UploadProofRequest**:

```php
'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'
```

---

## Job JSON-LD (returned in job payload)

Include an `ld_json` field in `GET /api/jobs/{id}` responses. Example structure (backend builds and returns):

```json
{
  "@context":"https://schema.org/",
  "@type":"JobPosting",
  "title":"...",
  "description":"<sanitized HTML>",
  "datePosted":"2025-12-01",
  "hiringOrganization":{"@type":"Organization","name":"..."},
  "employmentType":"FULL_TIME",
  "jobLocation":{"@type":"Place","address":{"@type":"PostalAddress","addressLocality":"Addis Ababa","addressCountry":"ET"}}
}
```

The backend should sanitize HTML (use `HTMLPurifier` or strip dangerous tags) before embedding in JSON-LD.

---

## Policies & security

* Implement Laravel Policies for `Job`, `Application`, `Transaction`.
* Only `EMPLOYER` or `ADMIN` can create / view applications for their jobs.
* Seeker can view/download their own CVs and proofs.
* Rate-limit auth endpoints via throttle middleware.
* Sanitize `description_html` before storing or before returning JSON-LD.

---

## Tests & documentation

* Add unit tests for critical models and feature tests for:

  * Auth flows (signup, login, google callback)
  * Job create/list/search
  * Apply with CV upload and secure download
  * Manual payment proof upload and admin approve/reject
* Provide a Postman collection and an OpenAPI (Swagger) JSON.

---

## Deployment on cPanel (step-by-step summary)

1. Upload project (git archive or composer package) to the server.
2. Set `.env` values in cPanel (use file editor). Ensure `APP_KEY` is set.
3. Run `composer install --no-dev` via SSH or cPanel terminal.
4. Run `php artisan migrate --force` and `php artisan db:seed --class=SeedInitial`.
5. Create `storage/app/private` and set permissions (700/755 as needed).
6. Configure cron: `* * * * * php /home/<user>/path/artisan schedule:run >> /dev/null 2>&1`.
7. (Optional) Set a supervisor-like mechanism for `php artisan queue:work` (or run via cron fallback).

---

## Immediate next steps (what I will deliver if you say "Go")

1. Full developer prompt + scaffold for Laravel 12: migrations, models, controllers, requests, policies for the above features.
2. Example implementations for local private file storage & streaming controller.
3. Manual payment flow endpoints (initiate, upload proof, admin approve/reject).
4. Google OAuth integration notes and callback handling (Socialite example).
5. Postman collection and README with cPanel deployment steps.

---

## Notes & decisions you already confirmed

* Using **cPanel local storage** for private files.
* **Google sign-in** implemented (plus phone and email collection).
* Payment: **manual** (screenshot + admin approval) now; real gateways added later.
* API domain default set to `api.cyberbiz.africa` (replace if needed).
* **UUID v4** for all major entities.

---

If this matches your needs, say **"Generate backend scaffold"** and I will produce the full developer prompt and Laravel scaffold files (migrations, model stubs, controllers, request classes, policy skeletons, and a README) in the next step.
