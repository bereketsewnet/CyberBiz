php# CyberBiz Africa - Admin Manual

This comprehensive manual covers all administrative features and systems in the CyberBiz Africa platform. Follow the step-by-step instructions to manage and test each feature.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Newsletter System](#newsletter-system)
3. [Services & Consulting System](#services--consulting-system)
4. [Native Advertising System](#native-advertising-system)
5. [Sponsorship Posts System](#sponsorship-posts-system)
6. [Affiliate Marketing System](#affiliate-marketing-system)
7. [Payment Management System](#payment-management-system)
8. [Jobs & Applications System](#jobs--applications-system)
9. [Products, Courses & E-Books System](#products-courses--e-books-system)
10. [Blog & Content Management](#blog--content-management)
11. [User Management](#user-management)
12. [Site Settings](#site-settings)
13. [Testing Checklist Summary](#testing-checklist-summary)
14. [Troubleshooting](#troubleshooting)
15. [API Endpoints Reference](#api-endpoints-reference)
16. [Support](#support)

---

## Getting Started

### Accessing the Admin Panel

1. **Login to the platform:**
   - Go to: `http://localhost:8080/login` (or your production URL)
   - Use your admin credentials
   - After login, admin users are redirected directly to the Admin Panel at `/admin`

2. **Navigate to Admin Panel (if needed):**
   - If you are not automatically redirected, click on your profile icon in the header
   - Select **"Admin Panel"** from the dropdown menu
   - Or directly visit: `http://localhost:8080/admin`

### Admin Dashboard Overview

The Admin Dashboard provides quick access to all management features:
- **Pending Payments** (Payment Management)
- **Manage Jobs**
- **Manage Products** (Courses & E-Books)
- **Manage Blogs**
- **Newsletters**
- **Services & Consulting**
- **Service Inquiries**
- **Native Ads**
- **Sponsorship Posts**
- **Affiliate Programs**
- **Manage Users**
- **Settings**

---

## Newsletter System

### Overview
The Newsletter System allows you to manage subscriber lists, create newsletters, and send them to all subscribers.

### Access Path
- Admin Dashboard → Click "Newsletters"
- Direct URL: `/admin/newsletters`

### Features to Test

#### 1. View Newsletter Subscribers

**Steps:**
1. Go to Admin Dashboard
2. Click "Newsletters" card
3. Click "Subscribers" tab (or navigate to `/admin/newsletters/subscribers`)
4. You should see a list of all newsletter subscribers

**What to check:**
- ✅ List displays subscriber email and name
- ✅ Shows subscription status (subscribed/unsubscribed)
- ✅ Shows subscription date
- ✅ Search functionality works

**Test Scenario:**
- Use the search bar to find a specific subscriber
- Filter by status (subscribed/unsubscribed)

#### 2. Create a Newsletter

**Steps:**
1. Go to `/admin/newsletters`
2. Click "Create Newsletter" button
3. Fill in the form:
   - **Subject**: "Welcome to CyberBiz Newsletter - January 2026"
   - **Content**: Enter HTML or plain text content
     ```
     <h1>Welcome to Our Newsletter!</h1>
     <p>This is a test newsletter to demonstrate the system.</p>
     <p>You can use HTML formatting here.</p>
     ```
4. Click "Create Newsletter"

**What to check:**
- ✅ Newsletter appears in the list
- ✅ Shows "Not Sent" status
- ✅ Subject and preview are correct

**Test Scenario:**
- Create a newsletter with HTML formatting
- Create another with plain text
- Verify both save correctly

#### 3. Send a Newsletter

**Steps:**
1. Go to `/admin/newsletters`
2. Find the newsletter you created
3. Click "Send" button
4. Confirm the action

**What to check:**
- ✅ Newsletter status changes to "Sent"
- ✅ Shows recipient count
- ✅ Shows sent date/time

**Note**: In production, this will actually send emails. In development, it tracks the action.

#### 4. Delete a Newsletter

**Steps:**
1. Go to `/admin/newsletters`
2. Find the newsletter to delete
3. Click the delete/trash icon
4. Confirm deletion

**What to check:**
- ✅ Newsletter is removed from the list
- ✅ No errors occur

#### 5. Test Newsletter Signup (Frontend)

**Steps:**
1. Logout from admin panel (or use incognito window)
2. Go to the homepage: `/`
3. Scroll to the footer
4. Find the "Newsletter" section
5. Enter an email address (e.g., `test@example.com`)
6. Optionally enter a name
7. Click "Subscribe"

**What to check:**
- ✅ Success message appears
- ✅ Email appears in admin subscribers list
- ✅ Status shows as "subscribed"

#### 6. Test Unsubscribe

**Steps:**
1. Visit: `/unsubscribe?email=test@example.com`
2. Or use the unsubscribe link from a newsletter email
3. Confirm unsubscribe

**What to check:**
- ✅ Success message appears
- ✅ Subscriber status changes to "unsubscribed" in admin panel

---

## Services & Consulting System

### Overview
Manage services/consulting offerings that users can request consultations for. Track and manage inquiries from potential clients.

### Access Path
- Admin Dashboard → Click "Services & Consulting"
- Direct URL: `/admin/services`

### Features to Test

#### 1. Create a Service

**Steps:**
1. Go to `/admin/services`
2. Click "Create Service" button
3. Fill in the form:
   - **Title**: "Web Development Services"
   - **Slug**: (leave empty to auto-generate) or "web-development"
   - **Description**: "Professional web development services including frontend, backend, and full-stack solutions"
   - **Content**: (Optional) Detailed HTML content
   - **Icon Name**: "code" (options: briefcase, code, palette, bar-chart, globe, smartphone, zap)
   - **Image URL**: (Optional) `https://example.com/image.jpg`
   - **Order**: 1 (higher numbers appear first)
   - **Active**: Toggle ON
   - **Meta Title**: (Optional) SEO meta title
   - **Meta Description**: (Optional) SEO meta description
4. Click "Create Service"

**What to check:**
- ✅ Service appears in the services list
- ✅ Shows as "Active"
- ✅ All fields are saved correctly

**Test Scenario:**
Create multiple services with different icons:
- "Digital Marketing" with icon "megaphone"
- "Graphic Design" with icon "palette"
- "Data Analytics" with icon "bar-chart"

#### 2. View Services (Public Page)

**Steps:**
1. Logout or use incognito window
2. Visit: `/services`
3. You should see all active services displayed

**What to check:**
- ✅ All active services are visible
- ✅ Services display with icons/images
- ✅ Each service has a "Learn More" button
- ✅ Services are ordered correctly

#### 3. View Service Detail Page

**Steps:**
1. From `/services`, click "Learn More" on any service
2. Or directly visit: `/services/{service-slug}`

**What to check:**
- ✅ Service details are displayed
- ✅ Image appears (if provided)
- ✅ Content section shows (if provided)
- ✅ Inquiry form is visible at the bottom

#### 4. Submit a Service Inquiry (Public)

**Steps:**
1. On a service detail page (`/services/web-development`)
2. Scroll to the "Request a Consultation" form
3. Fill in:
   - **Name**: "John Doe"
   - **Email**: "john@example.com"
   - **Phone**: "+251 911 234 567"
   - **Company**: "ABC Company"
   - **Message**: "I'm interested in web development services for my business."
4. Click "Submit Inquiry"

**What to check:**
- ✅ Success message appears
- ✅ Form clears after submission
- ✅ Inquiry appears in admin panel

#### 5. Manage Service Inquiries (Admin)

**Steps:**
1. Go to `/admin/services/inquiries`
2. You should see all inquiries listed

**What to check:**
- ✅ All inquiries are displayed
- ✅ Shows service name, contact info, message
- ✅ Status shows as "New"

**Filter & Search:**
- Filter by service using the dropdown
- Filter by status (new, contacted, in_progress, completed, cancelled)
- Search by name, email, or company

#### 6. Update Inquiry Status

**Steps:**
1. Go to `/admin/services/inquiries`
2. Find an inquiry
3. Use the status dropdown to change status (e.g., "Contacted")
4. Status updates immediately

**What to check:**
- ✅ Status badge updates
- ✅ Status change is saved

#### 7. Add Admin Notes to Inquiry

**Steps:**
1. Go to `/admin/services/inquiries`
2. Find an inquiry
3. Click "Edit" button
4. Add notes in "Admin Notes" field: "Called client on Jan 8, scheduled follow-up"
5. Click "Save"

**What to check:**
- ✅ Notes appear in blue box below the inquiry
- ✅ Notes persist after refresh

#### 8. Edit a Service

**Steps:**
1. Go to `/admin/services`
2. Click "Edit" on a service
3. Make changes (e.g., change description)
4. Click "Save Changes"

**What to check:**
- ✅ Changes are saved
- ✅ Updates reflect on public page

#### 9. Delete a Service

**Steps:**
1. Go to `/admin/services`
2. Click the trash icon on a service
3. Confirm deletion

**What to check:**
- ✅ Service is removed
- ✅ Service no longer appears on public page

#### 10. Send a Response to an Inquiry (Admin)

**Steps:**
1. Go to `/admin/services/inquiries`
2. Find an inquiry you want to answer and click the **"Send Response"** button.
3. In the popup dialog:
   - Choose an updated **Status** (for example: `Contacted`, `In Progress`, `Completed`, or `Cancelled`).
   - Type a clear **Response Message** in the text area (this is saved as admin notes for that inquiry).
4. Click **"Send Response"**.

**What to check:**
- ✅ Status badge changes to the new status
- ✅ The response text appears under **Admin Notes** for that inquiry
- ✅ Changes remain after refreshing the page

---

## Native Advertising System

### Overview
Manage native advertisements that blend seamlessly with content. Track impressions, clicks, and performance metrics.

### Access Path
- Admin Dashboard → Click "Native Ads"
- Direct URL: `/admin/native-ads`

### Features to Test

#### 1. Create a Native Ad

**Steps:**
1. Go to `/admin/native-ads`
2. Click "Create Native Ad" button
3. Fill in the form:
   - **Title**: "Premium Web Hosting"
   - **Description**: "Get 50% off on premium hosting plans"
   - **Image URL**: `https://example.com/hosting-ad.jpg`
   - **Link URL**: `https://example.com/hosting`
   - **Position**: Select "Content Inline"
   - **Type**: Select "Sponsored"
   - **Advertiser Name**: "Hosting Company"
   - **Active**: Toggle ON
   - **Start Date**: (Optional) Leave empty for immediate start
   - **End Date**: (Optional) Leave empty for no expiration
   - **Priority**: 10 (higher = shown first)
4. Click "Create Native Ad"

**What to check:**
- ✅ Ad appears in the list
- ✅ Shows as "Active"
- ✅ All fields saved correctly

**Test Different Positions:**
Create ads for different positions:
- Content Inline
- Sidebar
- Footer
- Between Posts
- After Content

#### 2. View Ad Stats

**Steps:**
1. Go to `/admin/native-ads`
2. View any ad in the list

**What to check:**
- ✅ Shows impressions count
- ✅ Shows clicks count
- ✅ Shows CTR (Click-Through Rate) percentage
- ✅ Stats update when ad is viewed/clicked

#### 3. Test Ad Display (Public)

**Steps:**
1. Create a native ad with position "After Content"
2. Logout or use incognito
3. Visit: `/blogs/{any-blog-post}`
4. Scroll to the bottom after the blog content

**What to check:**
- ✅ Native ad appears after content
- ✅ Shows sponsor badge if type is "Sponsored"
- ✅ Image displays (if provided)
- ✅ Ad is clickable

**Note**: The ad component automatically tracks impressions when loaded.

#### 4. Test Ad Click Tracking

**Steps:**
1. View a blog post with native ads
2. Click on the native ad
3. Ad should open in new tab
4. Return to admin panel: `/admin/native-ads`

**What to check:**
- ✅ Click count increased
- ✅ CTR percentage updated
- ✅ Link opens correct URL

#### 5. Reset Ad Stats

**Steps:**
1. Go to `/admin/native-ads`
2. Find an ad with stats
3. Click "Reset Stats" button
4. Confirm action

**What to check:**
- ✅ Impressions reset to 0
- ✅ Clicks reset to 0
- ✅ CTR shows as 0%

#### 6. Edit a Native Ad

**Steps:**
1. Go to `/admin/native-ads`
2. Click "Edit" on an ad
3. Change the title or priority
4. Click "Save Changes"

**What to check:**
- ✅ Changes are saved
- ✅ Updates reflect immediately

#### 7. Schedule an Ad (Start/End Dates)

**Steps:**
1. Create a new ad or edit existing
2. Set **Start Date**: Tomorrow's date
3. Set **End Date**: Next week's date
4. Save

**What to check:**
- ✅ Ad won't display until start date
- ✅ Ad stops displaying after end date
- ✅ Ad displays between start and end dates

#### 8. Test Priority System

**Steps:**
1. Create 2 ads for same position (e.g., "After Content")
2. Set Ad 1 priority: 5
3. Set Ad 2 priority: 10
4. View a blog post

**What to check:**
- ✅ Ad with priority 10 appears first
- ✅ Higher priority ads are shown before lower priority

---

## Sponsorship Posts System

### Overview
Create and manage sponsored content posts. These are special blog-like posts that highlight sponsors.

### Access Path
- Admin Dashboard → Click "Sponsorship Posts"
- Direct URL: `/admin/sponsorship-posts`

### Features to Test

#### 1. Create a Sponsorship Post

**Steps:**
1. Go to `/admin/sponsorship-posts`
2. Click "Create Sponsorship Post" button
3. Fill in the form:
   - **Title**: "How Company X Transformed Their Business"
   - **Slug**: (auto-generated) or "company-x-transformation"
   - **Content**: Full HTML content about the sponsor
     ```
     <h2>Introduction</h2>
     <p>Company X has achieved remarkable growth...</p>
     <h2>Key Achievements</h2>
     <ul>
       <li>200% revenue increase</li>
       <li>50 new clients</li>
     </ul>
     ```
   - **Excerpt**: "Discover how Company X achieved 200% growth..."
   - **Featured Image URL**: `https://example.com/sponsor-image.jpg`
   - **Sponsor Name**: "Company X"
   - **Sponsor Logo URL**: `https://example.com/company-x-logo.png`
   - **Sponsor Website**: `https://companyx.com`
   - **Sponsor Description**: "Leading business solutions provider"
   - **Status**: Select "Published"
   - **Published Date**: (Optional) Leave empty for immediate publish
   - **Expires Date**: (Optional) Set future date
   - **Priority**: 5
   - **Meta Title**: (Optional) SEO title
   - **Meta Description**: (Optional) SEO description
4. Click "Create Sponsorship Post"

**What to check:**
- ✅ Post appears in the list
- ✅ Shows correct status badge
- ✅ Priority is saved

#### 2. View Sponsorship Posts (Public - if published)

**Steps:**
1. Create a sponsorship post with status "Published"
2. Logout or use incognito
3. Visit: `/sponsorship-posts` (if public listing exists)
4. Or directly: `/sponsorship-posts/{slug}`

**What to check:**
- ✅ Published posts are visible
- ✅ Draft posts are NOT visible to public
- ✅ Sponsor information is displayed

#### 3. Edit a Sponsorship Post

**Steps:**
1. Go to `/admin/sponsorship-posts`
2. Click "Edit" on a post
3. Make changes (e.g., update content)
4. Click "Save Changes"

**What to check:**
- ✅ Changes are saved
- ✅ Updates reflect on public page (if published)

#### 4. Change Post Status

**Steps:**
1. Go to `/admin/sponsorship-posts`
2. Filter by status (e.g., "Draft")
3. Edit a draft post
4. Change status to "Published"
5. Save

**What to check:**
- ✅ Status badge updates
- ✅ Published posts become visible to public
- ✅ Draft posts are hidden from public

#### 5. Set Expiration Date

**Steps:**
1. Create/edit a sponsorship post
2. Set **Expires Date**: Tomorrow's date
3. Save

**What to check:**
- ✅ Post shows expiration date
- ✅ After expiration, post is no longer publicly visible
- ✅ Admin can still see expired posts

#### 6. Test Priority Ordering

**Steps:**
1. Create multiple sponsorship posts
2. Set different priorities (1, 5, 10)
3. View public listing (if implemented)

**What to check:**
- ✅ Higher priority posts appear first
- ✅ Posts are sorted correctly

#### 7. Archive a Post

**Steps:**
1. Go to `/admin/sponsorship-posts`
2. Edit a post
3. Change status to "Archived"
4. Save

**What to check:**
- ✅ Status shows as "Archived"
- ✅ Post is no longer publicly visible
- ✅ Post remains in admin list

#### 8. Delete a Sponsorship Post

**Steps:**
1. Go to `/admin/sponsorship-posts`
2. Click trash icon on a post
3. Confirm deletion

**What to check:**
- ✅ Post is permanently removed
- ✅ No errors occur

---

## Affiliate Marketing System

### Overview
Manage affiliate programs, track **impressions**, **clicks**, and **purchases**, and calculate commissions for each. Affiliates can join programs and earn:
- **Purchase commission** (percentage or fixed amount per sale)
- **Impression commission** (e.g., X ETB per Y views)
- **Click commission** (e.g., X ETB per Y clicks)

### Access Path
- Admin Dashboard → Click "Affiliate Programs"
- Direct URL: `/admin/affiliate/programs`

### Features to Test

#### 1. Create an Affiliate Program

**Steps:**
1. Go to `/admin/affiliate/programs`
2. Click "Create Program" button
3. Fill in the form:
   - **Program Name**: "Premium Course Affiliate Program"
   - **Description**: "Earn commissions by promoting our premium courses"
   - **Commission Type**: Select "Percentage"
   - **Commission Rate**: 20 (means 20%)
   - **Target URL**: `https://yoursite.com/courses`
   - **Cookie Duration**: 30 (days to track conversions)
   - **Active**: Toggle ON
4. Click "Create Program"

**What to check:**
- ✅ Program appears in the list
- ✅ Shows as "Active"
- ✅ Commission rate and type are correct

**Test Different Commission Types:**
- Create program with "Percentage" (e.g., 15%)
- Create program with "Fixed" (e.g., 100 ETB per conversion)

#### 2. View Affiliate Stats (Admin)

**Steps:**
1. Go to `/admin/affiliate/stats` (if route exists)
2. Or check stats on programs page

**What to check:**
- ✅ Total programs count
- ✅ Active programs count
- ✅ Total affiliate links
- ✅ Total impressions, clicks, and conversions across all programs
- ✅ Purchase, impression, and click commission totals per program
- ✅ Overall total commission
- ✅ Pending/Paid commission breakdown (if enabled in your reporting)

#### 3. Join an Affiliate Program (As User)

**Steps:**
1. Login as a regular user (not admin)
2. Visit: `/affiliate/dashboard`
3. You should see available programs (or visit `/affiliate/programs`)
4. Click "Join" on a program (or use API)

**Alternative (Direct API):**
1. Login as regular user
2. Use API endpoint: `POST /api/affiliate/programs/{programId}/join`

**What to check:**
- ✅ Affiliate link is created
- ✅ Unique tracking code is generated
- ✅ Link appears in user's affiliate dashboard

#### 4. View Affiliate Dashboard (User)

**Steps:**
1. Login as user who has joined a program
2. Visit: `/affiliate/dashboard`

**What to check:**
- ✅ Stats cards show:
  - Total Links
  - Total Clicks
  - Total Conversions
  - Total Commission
- ✅ Commission breakdown shows:
  - Pending Commission
  - Paid Commission
  - Total Commission
- ✅ My Affiliate Links section shows all links
- ✅ Each link shows:
  - Program name
  - Tracking code
  - Affiliate URL
  - Click count
  - Conversion count
  - Commission earned

#### 5. Copy Affiliate Link

**Steps:**
1. Go to `/affiliate/dashboard`
2. Find an affiliate link
3. Click "Copy Link" button

**What to check:**
- ✅ Link is copied to clipboard
- ✅ Success message appears
- ✅ Button shows "Copied!" temporarily

#### 6. Test Affiliate Link Click Tracking

**Steps:**
1. Get an affiliate link URL (e.g., `/affiliate/ABC123XYZ`)
2. Visit the link URL
3. Should redirect to target URL
4. Check admin panel or affiliate dashboard

**What to check:**
- ✅ Click is tracked
- ✅ Click count increases
- ✅ Redirects to correct target URL
- ✅ Cookie is set for conversion tracking

**Manual Test:**
1. Visit: `http://localhost:8000/api/affiliate/click/{code}`
2. Should return redirect URL
3. Click count should increase

#### 7. Track a Conversion (Test)

**Steps:**
1. Click an affiliate link first (sets cookie)
2. After a purchase/signup, call conversion API:
   ```
   POST /api/affiliate/conversion
   Body: {
     "transaction_id": "TXN-12345",
     "amount": 1000,
     "affiliate_code": "ABC123XYZ" // optional if cookie is set
   }
   ```

**What to check:**
- ✅ Conversion is created
- ✅ Commission is calculated correctly:
  - If percentage: amount × rate / 100
  - If fixed: fixed amount
- ✅ Conversion appears in admin panel
- ✅ Status is "Pending"

**Test Commission Calculation:**
- Create program with 20% commission
- Track conversion with amount 1000
- Commission should be 200

#### 8. Manage Conversions (Admin)

**Steps:**
1. Go to `/admin/affiliate/conversions` (if route/page exists)
2. Or check conversions via API: `GET /api/admin/affiliate/conversions`

**What to check:**
- ✅ All conversions are listed
- ✅ Shows affiliate, program, amount, commission
- ✅ Status is visible
- ✅ Can filter by status

#### 9. Approve a Conversion (Admin)

**Steps:**
1. Go to admin conversions list
2. Find a "Pending" conversion
3. Update status to "Approved"
4. Add optional notes: "Verified transaction, approved"

**What to check:**
- ✅ Status changes to "Approved"
- ✅ Notes are saved
- ✅ Commission remains the same

#### 10. Pay Commission (Admin)

**Steps:**
1. Find an "Approved" conversion
2. Change status to "Paid"
3. Add notes: "Paid via bank transfer on Jan 8, 2026"

**What to check:**
- ✅ Status changes to "Paid"
- ✅ Paid commission stats update
- ✅ Affiliate dashboard shows paid commission

#### 11. View Affiliate Links (Admin)

**Steps:**
1. Go to `/admin/affiliate/links` (if route/page exists)
2. Or use API: `GET /api/admin/affiliate/links`

**What to check:**
- ✅ All affiliate links are listed
- ✅ Shows program, affiliate, code
- ✅ Shows click and conversion counts
- ✅ Can filter by program or affiliate

#### 12. Test Cookie Duration

**Steps:**
1. Create program with cookie duration: 7 days
2. Click affiliate link
3. Wait 8 days (or manually test)
4. Track conversion without clicking again

**What to check:**
- ✅ Conversions within cookie duration are tracked
- ✅ Conversions after expiration are NOT tracked
- ✅ Cookie expires after set duration

#### 13. Edit Affiliate Program

**Steps:**
1. Go to `/admin/affiliate/programs`
2. Click "Edit" on a program
3. Change commission rate or description
4. Save

**What to check:**
- ✅ Changes are saved
- ✅ Existing affiliate links still work
- ✅ New commission rate applies to NEW conversions only

#### 14. Deactivate an Affiliate Program

**Steps:**
1. Edit an affiliate program
2. Toggle "Active" to OFF
3. Save

**What to check:**
- ✅ Program shows as "Inactive"
- ✅ New users cannot join
- ✅ Existing links may still track (depends on implementation)
- ✅ Program doesn't appear in public program list

---

## Payment Management System

### Overview
Use this section to review and manage all manual payment submissions (bank transfer, mobile money, etc.). You can see full history (pending, approved, rejected), view proof screenshots, approve or reject payments, and permanently delete transactions if needed.

### Access Path
- Admin Dashboard → Click **"Pending Payments"**
- Direct URL: `/admin/payments`

### Features to Test

#### 1. View All Payments

**Steps:**
1. Go to `/admin/payments`.
2. Wait for the list of transactions to load.

**What to check:**
- ✅ Each card shows customer name, product, amount, date, and status badge.
- ✅ Approved and rejected payments remain visible (history is not hidden after decision).
- ✅ Status badges use **Pending Approval**, **Approved**, or **Rejected**.

#### 2. Search Payments

**Steps:**
1. Stay on `/admin/payments`.
2. Use the search box to type a customer's name or product title.

**What to check:**
- ✅ List filters in real time based on your keyword.
- ✅ Clearing the search shows all payments again.

#### 3. View Payment Details & Proof

**Steps:**
1. In the payment list, find a transaction with a **"View Proof"** button (not "No Proof").
2. Click **"View Proof"**.

**What to check:**
- ✅ A modal opens showing customer, product, amount, and purchase date.
- ✅ The proof image loads inside a fixed rectangle and is fully visible (no overflow).
- ✅ If there is no proof uploaded, the button is disabled and shows **"No Proof"**.

#### 4. Approve a Payment

**Steps:**
1. Find a payment with status **Pending Approval**.
2. Click the **"Approve"** button.

**What to check:**
- ✅ Status badge changes to **Approved**.
- ✅ The card stays in the list but with updated status.
- ✅ The user gets access to the purchased product in their library.

#### 5. Reject a Payment

**Steps:**
1. Find a payment with status **Pending Approval**.
2. Click the **"Reject"** button.
3. Optionally enter a rejection reason in the popup.

**What to check:**
- ✅ Status badge changes to **Rejected**.
- ✅ The rejection reason is saved on the backend (for audit/debugging).
- ✅ The user does **not** receive access to the product.

#### 6. Delete a Transaction

**Steps:**
1. For any transaction, click the **"Delete"** button.
2. Confirm the warning dialog.

**What to check:**
- ✅ The transaction is removed from the list.
- ✅ Associated payment proof file is deleted from storage.
- ✅ Any automatically granted product access and related affiliate conversion records are also removed.

---

## Jobs & Applications System

### Overview
Manage job postings created on the platform. Admins can review, search, edit, and delete jobs, and see how many applications each job has received.

### Access Path
- Admin Dashboard → Click **"Manage Jobs"**
- Direct URL: `/admin/jobs`

### Features to Test

#### 1. View Jobs List

**Steps:**
1. Go to `/admin/jobs`.

**What to check:**
- ✅ Each job shows title, employer, created date, status (Published/Draft/Archived), and application count.
- ✅ Status badges match the job status.

#### 2. Search Jobs

**Steps:**
1. Stay on `/admin/jobs`.
2. Use the search box to type a job title or keyword.

**What to check:**
- ✅ Jobs filter based on your search term.
- ✅ Clearing the search returns to the full list.

#### 3. Create a Job

**Steps:**
1. On `/admin/jobs`, click **"Create Job"**.
2. Fill in job title, description, requirements, and other required fields.
3. Choose an appropriate status (for example, **Published** for live jobs).
4. Save.

**What to check:**
- ✅ New job appears in the admin list.
- ✅ Status is set correctly.
- ✅ Application count starts at 0.

#### 4. View Job Detail (Public Page)

**Steps:**
1. From the admin job list, click **"View Details"** on any job.

**What to check:**
- ✅ You are taken to the public job detail page (`/jobs/{id}`).
- ✅ All key information (title, description, requirements, etc.) is visible.
- ✅ Apply button appears for eligible roles (seekers/learners).

#### 5. Edit a Job

**Steps:**
1. From `/admin/jobs`, click **"Edit"** on a job.
2. Change fields such as title, description, or status.
3. Save.

**What to check:**
- ✅ Changes appear in the admin list and public job detail page.
- ✅ Status badge updates if changed.

#### 6. Delete a Job

**Steps:**
1. From `/admin/jobs`, click the **trash** icon on a job.
2. Confirm deletion.

**What to check:**
- ✅ Job is removed from the admin list.
- ✅ Job is no longer reachable on the public job detail URL.

---

## Products, Courses & E-Books System

### Overview
Manage all digital products sold on the site, including online courses and e-books. Admins can create, edit, and delete products, set prices, and manage thumbnails.

### Access Path
- Admin Dashboard → Click **"Manage Products"**
- Direct URL: `/admin/products`

### Features to Test

#### 1. View Products List

**Steps:**
1. Go to `/admin/products`.

**What to check:**
- ✅ Cards show product thumbnail (if set), title, short description, type (COURSE or EBOOK), and price in ETB.
- ✅ Type badge correctly shows **COURSE** or **EBOOK**.

#### 2. Filter by Type

**Steps:**
1. On `/admin/products`, use the tabs:
   - **All**
   - **Courses**
   - **E-Books**

**What to check:**
- ✅ Each tab filters the list to the selected product type.
- ✅ Counts and pagination update correctly per tab.

#### 3. Search Products

**Steps:**
1. Use the search box to type part of a product title or description.

**What to check:**
- ✅ List filters to matching products.
- ✅ Clearing the search returns to the full list.

#### 4. Create a Product

**Steps:**
1. Click **"Create Product"**.
2. Choose a product type (Course or E-Book).
3. Fill in title, description, price, and upload a thumbnail image.
4. Provide any required content fields (for example, course content or e-book file information).
5. Save.

**What to check:**
- ✅ Product appears in the list in the correct tab (course vs e-book).
- ✅ Thumbnail image displays in the card.
- ✅ Price displays in ETB.

> **Note:** In production, product images are served from the API domain. A valid thumbnail URL looks like  
> `https://api.cyberbizafrica.com/storage/products/thumbnails/6970f502d7e88_1769010434.jpeg`  
> (see example from [`api.cyberbizafrica.com`](https://api.cyberbizafrica.com/storage/products/thumbnails/6970f502d7e88_1769010434.jpeg)).

#### 5. View Product Detail (Public Page)

**Steps:**
1. From the admin list, click **"View"** on a product.

**What to check:**
- ✅ You are taken to `/products/{id}`.
- ✅ Thumbnail, title, price, and description appear correctly.
- ✅ Purchase/checkout button is visible for logged-in users.

#### 6. Edit a Product

**Steps:**
1. From `/admin/products`, click **"Edit"** on a product.
2. Change fields (title, price, description, image, etc.).
3. Save.

**What to check:**
- ✅ Changes appear immediately on the admin list.
- ✅ Public product detail page shows the updated information.

#### 7. Delete a Product

**Steps:**
1. From `/admin/products`, click the **trash** icon on a product.
2. Confirm deletion.

**What to check:**
- ✅ Product is removed from the admin list.
- ✅ Product page is no longer accessible to users.

---

## Blog & Content Management

### Overview
Manage all blog posts published on the site. Admins can create content, save drafts, publish, edit, and delete posts.

### Access Path
- Admin Dashboard → Click **"Manage Blogs"**
- Direct URL: `/admin/blogs`

### Features to Test

#### 1. View Blog Posts

**Steps:**
1. Go to `/admin/blogs`.

**What to check:**
- ✅ Each entry shows title, excerpt, category (if set), author, published date (if published), and status.
- ✅ Status badge shows `published` or `draft`.

#### 2. Search Blog Posts

**Steps:**
1. Use the search box to type part of a blog title or keyword.

**What to check:**
- ✅ List filters to matching posts.
- ✅ Clearing search restores full list.

#### 3. Create a Blog Post

**Steps:**
1. Click **"Create Blog Post"**.
2. Fill in title, content (HTML or rich text), excerpt, category, and optional featured image.
3. Choose a status (`draft` or `published`).
4. Save.

**What to check:**
- ✅ New blog appears in the admin list.
- ✅ Status is correct.
- ✅ Featured image appears (if provided).

#### 4. View Blog Post (Public Page)

**Steps:**
1. From the admin list, click **"View"** on a blog.

**What to check:**
- ✅ You are taken to `/blogs/{id}`.
- ✅ Content, featured image, and metadata are displayed correctly.
- ✅ Draft posts are not visible publicly unless you are accessing via admin.

#### 5. Edit a Blog Post

**Steps:**
1. From `/admin/blogs`, click **"Edit"** on a blog.
2. Update title, content, excerpt, status, etc.
3. Save.

**What to check:**
- ✅ Changes appear in admin list.
- ✅ Public blog page reflects changes for published posts.

#### 6. Delete a Blog Post

**Steps:**
1. From `/admin/blogs`, click **"Delete"**.
2. Confirm.

**What to check:**
- ✅ Post is removed from admin list.
- ✅ Public blog URL no longer loads the post.

---

## User Management

### Overview
View and manage all user accounts on the platform, including roles (Admin, Employer, Seeker, Learner), credits, and passwords.

### Access Path
- Admin Dashboard → Click **"Manage Users"**
- Direct URL: `/admin/users`

### Features to Test

#### 1. View Users List

**Steps:**
1. Go to `/admin/users`.

**What to check:**
- ✅ Each entry shows full name, email, phone (if provided), role badge, credits, and join date.
- ✅ Role badges correctly display `ADMIN`, `EMPLOYER`, `SEEKER`, or `LEARNER`.

#### 2. Search Users

**Steps:**
1. Use the search box to search by name or email.

**What to check:**
- ✅ Results filter as you type.
- ✅ Clearing search restores full list.

#### 3. View User Detail

**Steps:**
1. From the user list, click **"View"**.

**What to check:**
- ✅ Detailed information for that user is visible (including role and contact details).
- ✅ Any additional sections (for example, jobs or purchases) show correctly if present.

#### 4. Reset a User Password

**Steps:**
1. In the user list, click **"Reset Password"**.
2. Either:
   - Type a secure password manually, or
   - Click **"Generate"** to auto-generate a strong password.
3. Click **"Reset Password"** in the modal.

**What to check:**
- ✅ Validation requires at least 8 characters.
- ✅ Success message appears.
- ✅ The modal closes and the new password is now active.

> **Tip:** After resetting, share the new password securely with the user and ask them to change it after login.

#### 5. Delete a User

**Steps:**
1. Click the **trash** icon next to a user.
2. Confirm deletion.

**What to check:**
- ✅ User is removed from the list.
- ✅ The user can no longer log in.

---

## Site Settings

### Overview
Manage global site contact information and social media links that appear in the footer and contact sections.

### Access Path
- Admin Dashboard → Click **"Settings"**
- Direct URL: `/admin/settings`

### Features to Test

#### 1. View Current Settings

**Steps:**
1. Go to `/admin/settings`.

**What to check:**
- ✅ Existing address, email, phone number, and social URLs are loaded into the form.
- ✅ Loading state appears briefly while data is fetched.

#### 2. Update Contact Information

**Steps:**
1. In the **Contact Information** section, update address, email, and phone.
2. Click **"Save Settings"**.

**What to check:**
- ✅ Success message appears.
- ✅ Refreshing the page shows the updated values.
- ✅ New contact info appears in the site footer/contact page.

#### 3. Update Social Media Links

**Steps:**
1. In the **Social Media Links** section, fill in or update Facebook, Twitter, LinkedIn, Instagram, and YouTube URLs.
2. Click **"Save Settings"**.

**What to check:**
- ✅ Success message appears.
- ✅ Social icons on the frontend point to the new URLs.
- ✅ Empty fields do not break the footer (they are treated as optional).

#### 4. Validation & Errors

**Steps:**
1. Try saving with invalid URLs or emails.

**What to check:**
- ✅ Validation errors are shown as toast messages.
- ✅ No invalid data is saved.

---

## Testing Checklist Summary

Use this checklist to verify all features are working:

### Newsletter System
- [ ] Create newsletter
- [ ] Send newsletter
- [ ] View subscribers
- [ ] Frontend signup works
- [ ] Unsubscribe works
- [ ] Delete newsletter

### Services & Consulting
- [ ] Create service
- [ ] View services page (public)
- [ ] Submit inquiry (public)
- [ ] View inquiries (admin)
- [ ] Update inquiry status
- [ ] Add admin notes
- [ ] Send response from "Send Response" modal
- [ ] Edit service
- [ ] Delete service

### Payment Management
- [ ] View all payments (including approved/rejected history)
- [ ] Search payments by user or product
- [ ] Open payment proof modal and see screenshot
- [ ] Approve a payment
- [ ] Reject a payment (with optional reason)
- [ ] Delete a transaction and confirm it disappears

### Jobs & Applications
- [ ] View jobs list with application counts
- [ ] Search jobs
- [ ] Create a job (Published)
- [ ] View job detail page (public)
- [ ] Edit a job
- [ ] Delete a job

### Products, Courses & E-Books
- [ ] Create a course product
- [ ] Create an e-book product
- [ ] Confirm thumbnails display on admin cards
- [ ] View product detail page (public)
- [ ] Edit a product
- [ ] Delete a product

### Blog & Content Management
- [ ] Create blog post
- [ ] Publish a blog post
- [ ] View blog on public page
- [ ] Edit a blog post
- [ ] Delete a blog post

### User Management
- [ ] View users list
- [ ] Search users by name/email
- [ ] View user detail
- [ ] Reset a user password from admin
- [ ] Delete a user

### Site Settings
- [ ] Update contact address/email/phone
- [ ] Update social media links
- [ ] Confirm footer/contact info shows new values

### Native Advertising
- [ ] Create native ad
- [ ] View ad on blog post
- [ ] Track impressions
- [ ] Track clicks
- [ ] View stats
- [ ] Reset stats
- [ ] Test priority
- [ ] Schedule ad (dates)

### Sponsorship Posts
- [ ] Create sponsorship post
- [ ] Publish post
- [ ] View as draft vs published
- [ ] Edit post
- [ ] Set expiration
- [ ] Archive post
- [ ] Delete post

### Affiliate Marketing
- [ ] Create affiliate program (with purchase/impression/click commissions)
- [ ] Join program (as user)
- [ ] View affiliate dashboard
- [ ] Copy affiliate link
- [ ] Track impression & click
- [ ] Track conversion
- [ ] Calculate commission correctly
- [ ] Approve conversion (admin)
- [ ] Pay commission (admin)
- [ ] View stats in admin programs and affiliate links

---

## Troubleshooting

### Newsletter Not Sending
- Check email configuration in `.env`
- Verify mail driver settings
- Check queue workers if using queues

### Service Inquiry Not Appearing
- Check inquiry was submitted successfully
- Verify admin is logged in
- Check browser console for errors

### Native Ad Not Displaying
- Verify ad is active
- Check start/end dates
- Verify position matches component placement
- Check ad priority

### Affiliate Link Not Tracking
- Verify link code is correct
- Check affiliate link is active
- Verify program is active
- Check cookie settings in browser

### Conversion Not Tracking
- Verify affiliate code is set (cookie or parameter)
- Check cookie hasn't expired
- Verify transaction_id is unique
- Check commission calculation matches program settings

### Payment or Image Issues
- If a payment proof image does not load, confirm the transaction has a proof file (button should not show **"No Proof"**).
- Check the browser network tab for 404/500 errors when loading the proof endpoint.
- If a product thumbnail is not visible, verify the thumbnail URL works directly in the browser and uses the API domain (for example: `https://api.cyberbizafrica.com/storage/products/thumbnails/6970f502d7e88_1769010434.jpeg`).

---

## API Endpoints Reference

For advanced testing, you can use these API endpoints directly:

### Newsletter
- `GET /api/admin/newsletters` - List newsletters
- `POST /api/admin/newsletters` - Create newsletter
- `POST /api/admin/newsletters/{id}/send` - Send newsletter
- `POST /api/newsletter/subscribe` - Public subscribe

### Services
- `GET /api/services` - List services (public)
- `POST /api/admin/services` - Create service
- `POST /api/services/{id}/inquiry` - Submit inquiry

### Native Ads
- `GET /api/native-ads?position=after_content` - Get ads for position
- `POST /api/native-ads/{id}/click` - Track click
- `GET /api/admin/native-ads` - List ads (admin)

### Sponsorship Posts
- `GET /api/sponsorship-posts` - List posts (public)
- `POST /api/admin/sponsorship-posts` - Create post

### Affiliate
- `GET /api/affiliate/programs` - List programs (public)
- `POST /api/affiliate/programs/{id}/join` - Join program
- `GET /api/affiliate/click/{code}` - Track click
- `POST /api/affiliate/conversion` - Track conversion
- `GET /api/affiliate/dashboard` - User dashboard

---

## Support

For additional help or questions, refer to:
- Laravel documentation: https://laravel.com/docs
- React documentation: https://react.dev
- Project repository README

---

**Last Updated**: January 8, 2026
**Version**: 1.0

