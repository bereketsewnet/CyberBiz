# CyberBiz Africa – User Manual

This manual explains how regular users (Job Seekers, Learners, Employers, and Affiliates) can use the CyberBiz Africa website.
Follow these step‑by‑step guides to navigate the platform, apply for jobs, buy courses/e‑books, and manage your account.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Account & Profile](#account--profile)
3. [Role Overview](#role-overview)
4. [Using the Main Navigation](#using-the-main-navigation)
5. [Job Seeker Guide](#job-seeker-guide)
6. [Learner Guide](#learner-guide)
7. [Employer Guide](#employer-guide)
8. [Affiliate Guide](#affiliate-guide)
9. [Services & Consulting Requests](#services--consulting-requests)
10. [Purchasing Courses & E‑Books](#purchasing-courses--e-books)
11. [My Library](#my-library)
12. [Jobs & Applications](#jobs--applications)
13. [Support & Troubleshooting](#support--troubleshooting)

---

## Getting Started

### 1. Creating an Account

1. Open the website in your browser (for example: `http://localhost:8080` or your live domain).
2. In the top‑right corner, click **Get Started**.
3. Fill in the registration form:
   - Full name
   - Email address
   - Password
   - (If asked) choose your role (Job Seeker, Employer, Learner, etc.).
4. Submit the form.

**What to check:**
- You are redirected to the login page or logged in automatically.
- You can see your name or avatar in the top‑right corner.

### 2. Logging In

1. Click **Sign In** in the top‑right corner.
2. Enter your email and password.
3. Click **Login**.

**What happens after login:**
- **Admins** are redirected directly to the **Admin Panel** at `/admin`.
- **All other users** (Job Seekers, Employers, Learners, etc.) are redirected to their **Dashboard** at `/dashboard`.

If you tried to apply for a job or request a service while logged out, you will be redirected to **/login** first.  
After login you will be taken back to the page you came from so you can complete your action.

### 3. Logging Out

1. Click on your **profile avatar/name** in the top‑right corner.
2. In the dropdown, click **Logout**.
3. You will be logged out and returned to the public site.

---

## Account & Profile

### Accessing Your Dashboard

1. After login, you are automatically taken to `/dashboard`.
2. You can also reach your dashboard at any time by:
   - Clicking on your **profile avatar** → selecting **Dashboard** (on mobile menu).

Your dashboard shows:
- A welcome message with your **role** (Job Seeker, Employer, Learner, etc.).
- Your current **credits**.
- **Quick action cards** such as:
  - Browse Jobs
  - My Applications
  - My Jobs (Employers only)
  - Post New Job (Employers only)
  - My Library
  - Browse Courses
  - Saved Jobs
  - Affiliate Programs

Click any card to go directly to that section.

---

## Role Overview

CyberBiz Africa supports several user roles:

- **Job Seeker (SEEKER)**  
  Focused on finding and applying for jobs, tracking applications, and saving interesting vacancies.

- **Learner (LEARNER)**  
  Focused on buying courses and e‑books, learning new skills, and can also apply for jobs.

- **Employer (EMPLOYER)**  
  Focused on posting jobs, managing their own job listings, and reviewing applications.

- **Affiliate (any role)**  
  Any non‑admin user can join affiliate programs to promote CyberBiz Africa content and earn commissions.

> Note: Admin users have a separate admin manual. This user manual is for non‑admin accounts.

---

## Using the Main Navigation

At the top of every page you’ll find the main navigation bar:

- **Jobs** → `/jobs`  
  Browse all available job postings.

- **Courses** → `/courses`  
  Browse training courses and e‑learning products.

- **Blog** → `/blogs`  
  Read news, tips, and educational content.

- **Services** → `/services`  
  View consulting and service offerings and request consultations.

- **About / Contact**  
  Learn more about CyberBiz Africa and contact the team.

### Profile Dropdown (Top‑Right)

When logged in, click your avatar/name to open the profile menu:

- **Dashboard** → Your main dashboard at `/dashboard`.
- **My Applications** (Job Seeker) → `/my-applications`
- **My Jobs** (Employer) → `/my-jobs`
- **My Library** (Job Seeker & Learner) → `/my-library`
- **Saved Jobs** → `/my-favorites`
- **Affiliate Programs** → `/affiliate/programs`
- **Affiliate Dashboard** → `/affiliate/dashboard`
- **Admin Panel** (Admin only) → `/admin`
- **Logout** → sign out of your account.

Use this dropdown as the main entry point to all user‑specific sections.

---

## Job Seeker Guide

This section covers everything a **Job Seeker** needs to know.

### 1. Accessing Your Job Seeker Dashboard

1. Log in with your Job Seeker account.
2. You will land on `/dashboard` with the title **Job Seeker Dashboard**.
3. Quick actions include:
   - **Browse Jobs** (`/jobs`)
   - **My Applications** (`/my-applications`)
   - **My Library** (`/my-library`)
   - **Browse Courses** (`/courses`)
   - **Saved Jobs** (`/my-favorites`)
   - **Affiliate Programs** (`/affiliate/programs`)

### 2. Browsing Jobs

1. From the top navigation, click **Jobs** or from the dashboard click **Browse Jobs**.
2. Use the search bar and filters (if available) to find relevant roles.
3. Click on a job card to open its **Job Detail** page (`/jobs/{id}`).

**What to check:**
- Job detail shows title, company, location, job type, deadline, and full description.
- Information about number of applicants is visible when available.

### 3. Applying for a Job

> You must be logged in as a Job Seeker or Learner to apply.

1. Open a job detail page.
2. Click the **Apply Now** button.
3. An **Apply** modal will open:
   - Upload your **CV** (`.pdf` or `.docx`).
   - Optionally write a **cover letter** (short message about why you’re a good fit).
4. Submit the application.

**What to check:**
- You see a success message.
- The apply button changes to **Application Submitted**.
- A **Remove Application** button appears next to it.

### 4. Removing an Application

If you applied by mistake or want to withdraw:

1. Go back to the job detail page.
2. You will see:
   - A disabled **Application Submitted** button.
   - A **Remove Application** button.
3. Click **Remove Application**.

**What to check:**
- The button text switches back to **Apply Now**.
- Your application no longer appears in **My Applications**.

### 5. Managing My Applications

1. Open the profile dropdown and click **My Applications** or use the dashboard card.
2. Review the list of jobs you have applied for.

**What to check:**
- Each item shows job title, employer, and application date.
- You can click through to job detail pages.

### 6. Saving Favorite Jobs

1. On a job detail page, click the **bookmark icon** next to “Apply Now” to save or unsave the job.
2. Saved jobs are listed under **Saved Jobs** (`/my-favorites`).

**What to check:**
- The bookmark icon highlights when a job is saved.
- The job appears in the Saved Jobs list.

---

## Learner Guide

Learners can buy courses/e‑books and also apply for jobs.

### 1. Accessing Your Learner Dashboard

1. Log in with your Learner account.
2. You will land on `/dashboard` with the title **Learner Dashboard**.
3. Quick actions include:
   - **Browse Jobs** (`/jobs`)
   - **My Applications** (`/my-applications`)
   - **My Library** (`/my-library`)
   - **Browse Courses** (`/courses`)
   - **Saved Jobs** (`/my-favorites`)
   - **Affiliate Programs** (`/affiliate/programs`)

### 2. Browsing Courses & E‑Books

1. Click **Courses** in the top navigation or **Browse Courses** on your dashboard.
2. View available:
   - **Courses** (online trainings).
   - **E‑Books** (digital books).
3. Click a product to open the **Product Detail** page (`/products/{id}`).

**What to check:**
- You can see title, description, price, and thumbnail image.
- Type is clearly shown (COURSE or EBOOK).

### 3. Purchasing a Course or E‑Book

1. On a product detail page, click the purchase button (for example: **Buy Now** or similar).
2. Follow the instructions (manual payment, bank transfer, or other gateway depending on configuration).
3. Upload payment proof if requested (e.g., screenshot of receipt).
4. Wait for admin approval of your payment.

**What to check:**
- You receive a success message after submitting payment details.
- After admin approves, the product appears in **My Library**.

### 4. Accessing Purchased Content

1. Open the profile dropdown → **My Library** (`/my-library`).
2. You will see all approved purchased courses and e‑books.
3. Click a library item to:
   - Open the course content.
   - Download or read the e‑book (depending on implementation).

### 5. Applying for Jobs as a Learner

Learners can also apply for jobs using the **same flow as Job Seekers**:

1. Browse jobs at `/jobs`.
2. Open a job detail page.
3. Click **Apply Now**, upload your CV, and optionally add a cover letter.
4. After submission, the button changes to **Application Submitted**, with the option to **Remove Application**.

---

## Employer Guide

Employers can create and manage their own job postings and review applications.

### 1. Accessing Your Employer Dashboard

1. Log in with your Employer account.
2. You will land on `/dashboard` with the title **Employer Dashboard**.
3. Quick actions include:
   - **Browse Jobs** (`/jobs`)
   - **My Applications** (`/my-applications`)
   - **My Jobs** (`/my-jobs`)
   - **Post New Job** (`/my-jobs/create`)
   - **My Library**
   - **Browse Courses**
   - **Saved Jobs**
   - **Affiliate Programs**

### 2. Posting a New Job

1. From your dashboard, click **Post New Job** or open the profile menu (Employer) and select **My Jobs**, then use the create option.
2. Fill in job details:
   - Title
   - Description / Responsibilities
   - Location
   - Job type
   - Experience level
   - Application deadline (if available)
3. Choose the status (usually **Published** to make it visible).
4. Save.

**What to check:**
- The job appears under **My Jobs**.
- The job appears on the public **Jobs** page if published.

### 3. Managing Existing Jobs

1. Go to **My Jobs** (`/my-jobs`).
2. Click **Edit** to update a job.
3. Click the **trash** icon to delete a job.

**What to check:**
- Edits appear on both **My Jobs** and public job detail pages.
- Deleted jobs disappear from both lists and their URLs no longer work.

### 4. Reviewing Applications

Depending on configuration, Employers may have access to an applications list for each job.
Use **My Jobs** and related application screens (if present) to:

- See who applied.
- View CVs and cover letters.
- Shortlist or contact candidates offline.

---

## Affiliate Guide

Any non‑admin user (Job Seeker, Learner, Employer) can join affiliate programs and earn commissions.

### 1. Viewing Available Programs

1. Open the profile dropdown.
2. Click **Affiliate Programs** (`/affiliate/programs`).
3. Browse the list of programs with details:
   - Program name
   - Description
   - Purchase commission rate (percentage or fixed ETB)
   - Impression commission (ETB per X views) if available
   - Click commission (ETB per X clicks) if available
   - Target URL (course, e‑book, or custom link)

### 2. Joining a Program

1. On the programs page, find a program you like.
2. Click **Join** or the equivalent button (if present).
3. The system will create a unique affiliate link for you.

**What to check:**
- Your new link appears in your **Affiliate Dashboard**.
- You can copy the link and share it.

### 3. Using the Affiliate Dashboard

1. Open the profile dropdown and click **Affiliate Dashboard** (`/affiliate/dashboard`).
2. At the top you’ll see **stats cards**:
   - Total Links
   - Total Clicks
   - Total Conversions
   - Total Commission
   - Pending Commission
   - Paid Commission
3. Below that, you see **My Affiliate Links**:
   - Program name
   - Active/Inactive status
   - Purchase commission rate
   - Impression and click commission details (if configured)
   - For each link:
     - Impressions
     - Clicks
     - Conversions/purchases
     - Commission earned (by type)

### 4. Copying and Testing Your Affiliate Link

1. In **My Affiliate Links**, click the **Copy** icon next to your link.
2. Paste it into your browser or share it with your audience.
3. When someone clicks your link:
   - An impression and click are tracked.
   - They are redirected to the target URL (course, e‑book, or custom link).

**What to check:**
- Clicks and impressions go up over time in your dashboard.
- Conversions and commissions update after purchases are confirmed and approved.

---

## Services & Consulting Requests

You can request professional services (consulting, marketing, development, etc.) via the **Services** section.

### 1. Browsing Services

1. Click **Services** in the top navigation or visit `/services`.
2. Browse the list of service offerings.
3. Click **Learn More** on any service to open its detail page (`/services/{slug}`).

### 2. Submitting a Service Inquiry

> You must be logged in to submit a service inquiry.

1. On a service detail page, scroll to the **Request a Consultation** form.
2. Fill in:
   - Name
   - Email
   - Phone
   - Company (optional)
   - Message (explain what you need)
3. Click **Submit Inquiry**.

**What happens if you are not logged in:**
- Instead of showing validation errors, you will be redirected to **/login**.
- After login, you are sent back to the same service detail page to submit the form.

**What to check:**
- Success message appears.
- The form clears.
- Support/admin will contact you later using the details you provided.

---

## Purchasing Courses & E‑Books

(This section applies mainly to **Learners**, but Job Seekers and Employers can also purchase learning products.)

### Steps

1. Click **Courses** in the top navigation or **Browse Courses** from your dashboard.
2. Choose a product and open its detail page.
3. Click the **Buy** or **Purchase** button.
4. Follow payment instructions (manual bank transfer or gateway).
5. Upload proof if requested and submit.

After admin approves your payment:
- The product appears in **My Library**.
- You can access course content or download your e‑book from there.

---

## My Library

**My Library** is where you access all approved purchased content.

### Accessing My Library

1. Open the profile dropdown → click **My Library** (`/my-library`), or use the dashboard card.
2. You will see a grid/list of all courses and e‑books you own.
3. Click any item to:
   - Start or continue a course.
   - Open or download an e‑book.

If you don’t see a product in My Library:
- Confirm that your payment was approved.
- Contact support with your transaction details if needed.

---

## Jobs & Applications

This section summarizes the key job‑related features for all non‑admin roles.

### As a Visitor (Not Logged In)

- You can **browse jobs** and read details.
- When you click **Apply Now**, you will be redirected to **/login**.
- After login, you can return and submit your application.

### As a Logged‑In User (Job Seeker or Learner)

- You can:
  - Apply to jobs with CV + cover letter.
  - Remove applications.
  - Save jobs to your favorites.
  - Track applications from **My Applications**.
  - Manage saved jobs from **Saved Jobs**.

### As an Employer

- You can:
  - Post new jobs.
  - Edit or delete your own jobs.
  - Review applications attached to your jobs (where implemented).

---

## Support & Troubleshooting

If you encounter problems while using the site, try the tips below.

### Login or Access Issues

- Double‑check your email and password.
- If your account role changed (e.g., to Admin), make sure you log in and follow the redirect:
  - Admin → `/admin`
  - Other users → `/dashboard`
- If you are being redirected back to login when applying or submitting a service inquiry, it usually means you are not logged in or your session expired.

### Job Application Problems

- Make sure your CV file is in the allowed format (`.pdf` or `.docx`).
- Ensure the file size is not too large (according to platform limits).
- If the **Apply Now** button does not change to **Application Submitted**, check your internet connection and try again.

### Course / E‑Book Access Problems

- Confirm that your payment was submitted successfully.
- If you uploaded a payment screenshot, wait for admin approval.
- After approval, check **My Library** for the new item.

### Affiliate Tracking Problems

- Make sure you are using the full affiliate URL from your dashboard.
- Test the link in a private/incognito window to ensure cookies are set correctly.
- If clicks or impressions are not increasing, confirm:
  - You are sharing the correct link (not just copying the target URL).
  - Ad blockers are not interfering with tracking.

### Service Inquiry Problems

- If you see validation errors saying you must log in, sign in first then re‑submit the form.
- Ensure your message is long enough and fields like email are valid.

### Payment or Image Issues

- If a product image or payment proof does not load, refresh the page and check your connection.
- For products, ensure thumbnails are loading from the site’s storage (for example, on production:  
  `https://api.cyberbizafrica.com/storage/products/thumbnails/6970f502d7e88_1769010434.jpeg`).
- If issues persist, contact support and provide the product or transaction ID.

---

## Getting More Help

If you still have questions after reading this manual:

- Visit the **Contact** page on the site.
- Send a detailed message including:
  - Your name and email.
  - Your role (Job Seeker, Learner, Employer, Affiliate).
  - The page/URL where you had an issue.
  - Any error messages you saw.

The CyberBiz Africa team will help you resolve your issue and guide you through any remaining steps.***

