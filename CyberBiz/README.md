# CyberBiz Africa Backend API

Laravel 12 backend API for CyberBiz Africa platform - Job Board + LMS + CMS.

## Features

- ✅ Authentication (Email/Password + Google OAuth)
- ✅ Job Board with Full-Text Search
- ✅ CV Upload & Secure File Handling
- ✅ Manual Payment Flow (Screenshot + Admin Approval)
- ✅ JSON-LD Schema for SEO
- ✅ UUID Primary Keys
- ✅ Private File Storage (cPanel compatible)

## Technology Stack

- **Framework**: Laravel 12
- **Database**: MySQL (InnoDB)
- **Storage**: Local filesystem (cPanel compatible)
- **Auth**: Laravel Sanctum
- **OAuth**: Laravel Socialite (Google)

## Installation

### Prerequisites

- PHP 8.2+
- Composer
- MySQL 5.7+
- XAMPP (for local development)

### Setup Steps

1. **Clone and Install Dependencies**
   ```bash
   cd CyberBiz
   composer install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure `.env` file:**
   ```env
   APP_NAME=CyberBizAfrica
   APP_ENV=local
   APP_URL=http://localhost:8000
   
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=cyberbiz
   DB_USERNAME=root
   DB_PASSWORD=
   
   FILESYSTEM_DISK=local
   PRIVATE_FILES_DISK=private
   
   SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173
   SESSION_DOMAIN=.localhost
   QUEUE_CONNECTION=database
   
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
   
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USERNAME=your_mail_username
   MAIL_PASSWORD=your_mail_password
   MAIL_FROM_ADDRESS=hello@cyberbiz.africa
   ```

4. **Create Database**
   ```sql
   CREATE DATABASE cyberbiz;
   ```

5. **Run Migrations**
   ```bash
   php artisan migrate
   ```

6. **Create Storage Directories**
   ```bash
   mkdir -p storage/app/private/cvs
   mkdir -p storage/app/private/payments
   chmod -R 755 storage
   ```

7. **Start Development Server**
   ```bash
   php artisan serve
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/user` - Get current user (Auth required)
- `GET /api/auth/google/redirect` - Redirect to Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout (Auth required)

### Jobs
- `GET /api/jobs` - List jobs (public, supports `?q=search_term`)
- `GET /api/jobs/{id}` - Get job details
- `GET /api/jobs/{id}/jsonld` - Get JSON-LD schema
- `POST /api/jobs` - Create job (Employer/Admin)
- `PUT /api/jobs/{id}` - Update job (Owner/Admin)
- `DELETE /api/jobs/{id}` - Delete job (Owner/Admin)

### Applications
- `POST /api/jobs/{jobId}/apply` - Apply for job (Seeker)
- `GET /api/jobs/{jobId}/applications` - List applications (Employer/Admin)

### Files
- `GET /api/files/cv/{applicationId}` - Download CV (Authorized users)

### Payments
- `POST /api/payments/manual-initiate` - Initiate manual payment
- `POST /api/payments/{transactionId}/upload-proof` - Upload payment proof

### Admin
- `GET /api/admin/payments/pending` - List pending payments (Admin)
- `POST /api/admin/payments/{transactionId}/approve` - Approve payment (Admin)
- `POST /api/admin/payments/{transactionId}/reject` - Reject payment (Admin)
- `GET /api/admin/files/proof/{transactionId}` - Download payment proof (Admin)

## Database Schema

### Users
- UUID primary key
- Roles: ADMIN, EMPLOYER, SEEKER, LEARNER
- Subscription tiers: FREE, PRO_EMPLOYER

### Job Postings
- UUID primary key
- Full-text search on title and description
- JSON-LD field for SEO

### Applications
- UUID primary key
- CV stored in private storage
- Unique constraint on (job_id, seeker_id)

### Transactions
- UUID primary key
- Manual payment flow with approval workflow
- Status: PENDING → PENDING_APPROVAL → APPROVED/REJECTED

## Security

- All private files (CVs, payment proofs) stored in `storage/app/private/`
- Files served through secure controller endpoints with authorization checks
- Laravel Policies enforce access control
- Rate limiting on auth endpoints (configure in `app/Http/Kernel.php`)

## Deployment on cPanel

1. **Upload Project**
   - Upload all files to your cPanel directory (e.g., `public_html/api`)

2. **Configure Environment**
   - Edit `.env` file in cPanel file manager
   - Set `APP_ENV=production`
   - Configure database credentials
   - Set `APP_URL=https://api.cyberbiz.africa`

3. **Install Dependencies**
   ```bash
   composer install --no-dev --optimize-autoloader
   ```

4. **Run Migrations**
   ```bash
   php artisan migrate --force
   ```

5. **Set Permissions**
   ```bash
   chmod -R 755 storage bootstrap/cache
   mkdir -p storage/app/private/cvs storage/app/private/payments
   chmod -R 700 storage/app/private
   ```

6. **Configure Cron**
   Add to cPanel Cron Jobs:
   ```
   * * * * * cd /home/username/path/to/project && php artisan schedule:run >> /dev/null 2>&1
   ```

7. **Queue Worker** (Optional)
   ```bash
   php artisan queue:work --daemon
   ```
   Or use cPanel's Process Manager to keep it running.

## Testing

```bash
php artisan test
```

## License

Proprietary - CyberBiz Africa

## Support

For issues and questions, contact the development team.
