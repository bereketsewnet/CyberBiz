# CyberBiz Africa - Full Project Documentation

> Last Updated: December 2024

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Design System](#design-system)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Pages & Routes](#pages--routes)
7. [API Integration](#api-integration)
8. [State Management](#state-management)
9. [Mock Data Reference](#mock-data-reference)
10. [Components](#components)
11. [Authentication Flow](#authentication-flow)
12. [Feature Modules](#feature-modules)

---

## 🎯 Project Overview

**CyberBiz Africa** is a multi-role platform combining:
- **Job Board**: Employers post jobs, seekers apply with CV uploads
- **Learning Management System (LMS)**: Courses and e-books for learners
- **Payment Processing**: Manual payment gateway with admin approval
- **Ad Management**: Admin-controlled advertisement slots

### Target Audience
- African professionals seeking employment
- Employers looking to hire talent
- Learners wanting to upskill with courses/ebooks

---

## 🛠 Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + Custom Design System |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **State Management** | Zustand (client state) + React Query (server state) |
| **Animations** | Framer Motion |
| **Routing** | React Router DOM v6 |
| **Forms** | React Hook Form + Zod validation |
| **File Uploads** | react-dropzone |
| **Notifications** | Sonner (toast) |
| **HTTP Client** | Native Fetch API |

---

## 📁 Project Structure

```
src/
├── components/           # Reusable components
│   ├── auth/            # Authentication components
│   │   └── ProtectedRoute.tsx
│   ├── jobs/            # Job-related components
│   │   └── JobCard.tsx
│   ├── layout/          # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   ├── products/        # Product components
│   │   └── ProductCard.tsx
│   └── ui/              # shadcn/ui components
│
├── data/
│   └── mock/            # Mock data (for development)
│       ├── index.ts
│       ├── users.ts
│       ├── jobs.ts
│       └── products.ts
│
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── lib/                 # Utilities and configurations
│   ├── api.ts          # API client class
│   └── utils.ts        # Helper functions
│
├── pages/               # Page components
│   ├── HomePage.tsx
│   ├── JobsPage.tsx
│   ├── JobDetailPage.tsx
│   ├── CoursesPage.tsx
│   ├── AboutPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── DashboardPage.tsx
│   ├── NotFound.tsx
│   ├── admin/
│   │   ├── AdminDashboardPage.tsx
│   │   └── AdminPaymentsPage.tsx
│   ├── employer/
│   │   ├── MyJobsPage.tsx
│   │   ├── CreateJobPage.tsx
│   │   ├── EditJobPage.tsx
│   │   └── JobApplicationsPage.tsx
│   └── seeker/
│       ├── MyApplicationsPage.tsx
│       └── MyLibraryPage.tsx
│
├── services/            # API service layer
│   └── apiService.ts    # All API endpoint methods
│
├── store/               # Zustand stores
│   └── authStore.ts     # Authentication state
│
├── types/               # TypeScript type definitions
│   └── index.ts
│
├── App.tsx              # Main app component with routes
├── main.tsx             # Entry point
└── index.css            # Global styles & design tokens
```

---

## 🎨 Design System

### Color Palette

#### Light Mode
| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `30 20% 98%` | Page background (warm off-white) |
| `--foreground` | `222 47% 11%` | Main text (deep navy) |
| `--primary` | `38 92% 50%` | Amber gold - CTAs, highlights |
| `--secondary` | `222 47% 15%` | Deep navy - headers, emphasis |
| `--accent` | `24 80% 55%` | Burnt orange - accents |
| `--muted` | `30 15% 92%` | Muted backgrounds |
| `--destructive` | `0 84% 60%` | Error states |
| `--success` | `142 76% 36%` | Success states |

#### Dark Mode
| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `222 47% 8%` | Dark background |
| `--foreground` | `210 40% 98%` | Light text |
| `--card` | `222 47% 11%` | Card backgrounds |

### Typography

| Font | Usage |
|------|-------|
| **Plus Jakarta Sans** | Headings (h1-h6) - bold, tracking-tight |
| **DM Sans** | Body text - clean, readable |

### Custom CSS Classes

```css
/* Gradients */
.bg-hero-gradient     /* Dark hero sections */
.bg-gold-gradient     /* Primary CTA buttons */
.bg-card-gradient     /* Card backgrounds */
.text-gradient        /* Gold text effect */

/* Shadows */
.shadow-gold          /* Gold glow effect */
.shadow-lift          /* Elevated hover state */

/* Effects */
.glass                /* Glassmorphism effect */
.card-hover           /* Lift animation on hover */
.link-underline       /* Animated underline */
.pattern-dots         /* Dotted background pattern */
.pattern-grid         /* Grid background pattern */

/* Animations */
.animate-fade-in
.animate-slide-up
.animate-slide-in-right
.animate-scale-in
.animate-float
.animate-pulse-slow
.stagger-1 to .stagger-5  /* Staggered animation delays */
```

### Animation Guidelines
- Page transitions: 0.4s tween with anticipate easing
- Hover effects: scale 1.02 with shadow increase
- Card lift: translateY -4px
- Framer Motion for complex animations

---

## 👥 User Roles & Permissions

| Role | Description | Accessible Pages |
|------|-------------|------------------|
| **ADMIN** | Platform administrator | `/admin`, `/admin/payments`, all public pages |
| **EMPLOYER** | Job posters | `/my-jobs`, `/my-jobs/create`, `/my-jobs/:id/edit`, `/my-jobs/:id/applications` |
| **SEEKER** | Job applicants | `/my-applications`, `/my-library`, `/dashboard` |
| **LEARNER** | Course/ebook buyers | `/my-library`, `/dashboard` |

### Subscription Tiers
- `FREE` - Basic access
- `PRO_EMPLOYER` - Premium employer features

---

## 🗺 Pages & Routes

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing page with hero, featured jobs, courses |
| `/jobs` | JobsPage | Job listings with search |
| `/jobs/:id` | JobDetailPage | Job details + apply form |
| `/courses` | CoursesPage | Course/ebook catalog |
| `/about` | AboutPage | About CyberBiz Africa |
| `/login` | LoginPage | User login |
| `/signup` | SignupPage | User registration |

### Protected Routes (Authenticated)
| Route | Page | Required Role |
|-------|------|---------------|
| `/dashboard` | DashboardPage | Any authenticated |
| `/my-applications` | MyApplicationsPage | SEEKER, LEARNER |
| `/my-library` | MyLibraryPage | SEEKER, LEARNER |
| `/my-jobs` | MyJobsPage | EMPLOYER |
| `/my-jobs/create` | CreateJobPage | EMPLOYER |
| `/my-jobs/:id/edit` | EditJobPage | EMPLOYER |
| `/my-jobs/:id/applications` | JobApplicationsPage | EMPLOYER |
| `/admin` | AdminDashboardPage | ADMIN |
| `/admin/payments` | AdminPaymentsPage | ADMIN |

---

## 🔌 API Integration

### Backend URL
```
https://cyber-api.lula.com.et/api
```

### API Client (`src/lib/api.ts`)
- Uses native Fetch API
- Automatic token injection from Zustand store
- 401 handling with auto-logout and redirect
- FormData support for file uploads

### API Endpoints Reference

#### Authentication
```typescript
POST /auth/login         { email, password }
POST /auth/signup        { full_name, email, phone, password, password_confirmation, role? }
GET  /auth/user          // Get current user
POST /auth/logout        // Logout
```

#### Jobs
```typescript
GET    /jobs             { q?, page?, status? }
GET    /jobs/:id
POST   /jobs             { title, description_html, status?, expires_at? }
PUT    /jobs/:id         { ...partial job data }
DELETE /jobs/:id
```

#### Applications
```typescript
POST /jobs/:id/apply           FormData: { cv, cover_letter? }
GET  /jobs/:id/applications    { page? }
GET  /files/cv/:applicationId  // Download CV
```

#### Products
```typescript
GET /products        { type?, page? }
GET /products/:id
GET /user/library    { page? }
```

#### Payments
```typescript
POST /payments/manual-initiate           { product_id, amount }
POST /payments/:id/upload-proof          FormData: { proof }
GET  /admin/payments/pending             { page? }
POST /admin/payments/:id/approve
POST /admin/payments/:id/reject          { reason? }
GET  /admin/files/proof/:transactionId   // Download proof
```

#### Ad Slots
```typescript
GET    /ads                    { position? }
GET    /admin/ads              { position?, is_active?, page? }
GET    /admin/ads/:id
POST   /admin/ads              { position, image_url, target_url, is_active? }
PUT    /admin/ads/:id          { ...partial ad data }
DELETE /admin/ads/:id
```

---

## 📦 State Management

### Auth Store (Zustand)
Location: `src/store/authStore.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}
```

**Persistence**: LocalStorage key `cyberbiz-auth`

### Server State (React Query)
Used for API data fetching with automatic caching and synchronization.

---

## 📊 Mock Data Reference

Mock data is centralized in `src/data/mock_data.ts` for development and testing.

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cyberbiz.africa | password123 |
| Employer 1 | employer1@cyberbiz.africa | password123 |
| Employer 2 | employer2@cyberbiz.africa | password123 |
| Seeker | seeker1@cyberbiz.africa | password123 |
| Learner | learner1@cyberbiz.africa | password123 |

### Mock Data Structure
See `src/data/mock_data.ts` for complete reference data including:
- Users (5 records)
- Jobs (6 records)
- Products (6 records - 4 courses, 2 ebooks)

---

## 🧩 Components

### Layout Components
- `Header` - Navigation with auth state awareness
- `Footer` - Site footer with links

### Feature Components
- `JobCard` - Job listing card with hover animation
- `ProductCard` - Course/ebook card
- `ProtectedRoute` - Route guard with role checking

### UI Components (shadcn/ui)
Full suite of shadcn/ui components available in `src/components/ui/`

---

## 🔐 Authentication Flow

1. **Login**: User submits email/password → API validates → Returns user + token
2. **Token Storage**: Zustand persists token to localStorage
3. **Request Auth**: API client injects Bearer token in headers
4. **Protected Routes**: `ProtectedRoute` checks auth state and role
5. **401 Handling**: API client auto-logs out and redirects to `/login`
6. **Logout**: Clears Zustand store and localStorage

---

## 📦 Feature Modules

### Job Board Module
- Job listings with search
- Job details with HTML description
- CV upload with react-dropzone
- Application tracking for seekers
- Application management for employers

### LMS Module
- Course and ebook catalog
- Product details
- User library (purchased items)
- Purchase flow with payment

### Payment Module
- Manual payment gateway
- Payment proof upload
- Admin approval/rejection workflow
- Transaction status tracking

### Ad Management Module
- Ad slot positions: HOME_HEADER, SIDEBAR, JOBS_BANNER, FOOTER
- Admin CRUD operations
- Impression tracking
- Active/inactive toggle

---

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Environment
The API URL is hardcoded in `src/lib/api.ts`. For different environments, modify:
```typescript
const API_BASE_URL = 'https://cyber-api.lula.com.et/api';
```

---

## 📝 Notes for Developers

1. **API Integration**: All API calls go through `apiService.ts` - never call `api` directly from components
2. **Authentication**: Always check `useAuthStore` for current user state
3. **Protected Routes**: Use `ProtectedRoute` wrapper with appropriate `role` or `allowedRoles` prop
4. **File Uploads**: Use FormData with `apiService` methods that handle multipart
5. **Styling**: Use design tokens from `index.css` - avoid hardcoded colors
6. **Animations**: Use Framer Motion for complex animations, CSS for simple ones
7. **Mock Data**: Reference `mock_data.ts` for test data structure

---

*Documentation maintained by CyberBiz Africa Development Team*
