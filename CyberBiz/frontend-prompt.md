  // Employer routes
  {
    path: '/my-jobs',
    element: <ProtectedRoute role="EMPLOYER"><MyJobsPage /></ProtectedRoute>,
  },
  {
    path: '/my-jobs/create',
    element: <ProtectedRoute role="EMPLOYER"><CreateJobPage /></ProtectedRoute>,
  },
  {
    path: '/my-jobs/:id/edit',
    element: <ProtectedRoute role="EMPLOYER"><EditJobPage /></ProtectedRoute>,
  },
  {
    path: '/my-jobs/:id/applications',
    element: <ProtectedRoute role="EMPLOYER"><JobApplicationsPage /></ProtectedRoute>,
  },

  // Admin routes
  {
    path: '/admin',
    element: <ProtectedRoute role="ADMIN"><AdminDashboardPage /></ProtectedRoute>,
  },
  {
    path: '/admin/payments',
    element: <ProtectedRoute role="ADMIN"><AdminPaymentsPage /></ProtectedRoute>,
  },
  {
    path: '/admin/payments/:id',
    element: <ProtectedRoute role="ADMIN"><AdminPaymentDetailPage /></ProtectedRoute>,
  },
  {
    path: '/admin/ads',
    element: <ProtectedRoute role="ADMIN"><AdminAdsPage /></ProtectedRoute>,
  },
  {
    path: '/admin/ads/create',
    element: <ProtectedRoute role="ADMIN"><AdminAdCreatePage /></ProtectedRoute>,
  },
  {
    path: '/admin/ads/:id/edit',
    element: <ProtectedRoute role="ADMIN"><AdminAdEditPage /></ProtectedRoute>,
  },
]);
```

### 8.2. Protected Route Component

```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

---

## 9. RESPONSIVE DESIGN GUIDELINES

### 9.1. Mobile-First Approach

**Design Principles:**
- Start with mobile layout (320px+)
- Progressively enhance for larger screens
- Touch-friendly targets (minimum 44x44px)
- Readable text (minimum 16px base font)
- Fast loading (optimize images, lazy load)

### 9.2. Breakpoint Strategy

```typescript
// src/utils/breakpoints.ts
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};

// Usage in components
<div className="
  grid grid-cols-1          // Mobile: 1 column
  md:grid-cols-2            // Tablet: 2 columns
  lg:grid-cols-3            // Desktop: 3 columns
  xl:grid-cols-4            // Large: 4 columns
">
```

### 9.3. Component Responsiveness Examples

**Header/Navbar:**
- Mobile: Hamburger menu, logo centered
- Tablet: Logo left, menu items visible
- Desktop: Full navigation with dropdowns

**Job Cards:**
- Mobile: Full width, stacked
- Tablet: 2 columns
- Desktop: 3-4 columns

**Forms:**
- Mobile: Single column, full width inputs
- Desktop: Multi-column layouts where appropriate

### 9.4. Image Optimization

```typescript
// Use Next.js Image component pattern with lazy loading
<img
  src={imageUrl}
  alt={altText}
  loading="lazy"
  className="w-full h-auto object-cover"
  style={{ aspectRatio: '16/9' }}
/>
```

---

## 10. ANIMATION SPECIFICATIONS

### 10.1. Animation Library: Framer Motion

**Installation:**
```bash
npm install framer-motion
```

### 10.2. Page Transitions

```typescript
// src/components/PageTransition.tsx
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
```

### 10.3. Component Animations

**Fade In Animation:**
```typescript
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
};
```

**Slide Up Animation:**
```typescript
const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};
```

**Stagger Children:**
```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

### 10.4. Micro-Interactions

**Button Hover:**
- Scale: 1.02 on hover
- Shadow: Increase on hover
- Color: Slight brightness change

**Card Hover:**
- Lift effect (translateY: -4px)
- Shadow increase
- Smooth transition (0.2s)

**Loading States:**
- Skeleton loaders for content
- Spinner for buttons
- Progress bars for file uploads

### 10.5. Scroll Animations

```typescript
// src/hooks/useScrollAnimation.ts
import { useInView } from 'react-intersection-observer';
import { useAnimation } from 'framer-motion';

export function useScrollAnimation() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return { ref, controls };
}
```

---

## 11. STATE MANAGEMENT STRATEGY

### 11.1. State Management Architecture

**Server State (React Query):**
- API data fetching
- Caching and synchronization
- Background updates

**Client State (Zustand):**
- Authentication state
- UI state (modals, sidebar)
- Form state (temporary)

### 11.2. Auth Store (Zustand)

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    { name: 'auth-storage' }
  )
);
```

### 11.3. React Query Setup

```typescript
// src/lib/react-query.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 11.4. Custom Hooks for Data Fetching

```typescript
// src/hooks/useJobs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';

export function useJobs(params?: { q?: string; page?: number }) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobService.getJobs(params),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJob(id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobService.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
```

---

## 12. AUTHENTICATION FLOW

### 12.1. Login Flow

```typescript
// src/pages/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const response = await authService.login(data);
      login(response.user, response.token);
      navigate('/dashboard');
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 12.2. Google OAuth Flow

```typescript
// src/components/auth/GoogleLoginButton.tsx
export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google/redirect`;
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      variant="outline"
      className="w-full"
    >
      <GoogleIcon className="mr-2" />
      Continue with Google
    </Button>
  );
}

// src/pages/OAuthCallbackPage.tsx
export function OAuthCallbackPage() {
  const { searchParams } = useSearchParams();
  const code = searchParams.get('code');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    if (code) {
      authService.handleGoogleCallback(code)
        .then((response) => {
          login(response.user, response.token);
          if (response.requires_phone) {
            navigate('/complete-profile?phone_required=true');
          } else {
            navigate('/dashboard');
          }
        })
        .catch((error) => {
          toast.error('Google authentication failed');
          navigate('/login');
        });
    }
  }, [code]);

  return <LoadingSpinner />;
}
```

### 12.3. Token Management

```typescript
// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 13. FILE UPLOAD HANDLING

### 13.1. CV Upload Component

```typescript
// src/components/forms/FileUpload.tsx
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  error?: string;
}

export function FileUpload({
  onFileSelect,
  accept = { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
  maxSize = 5 * 1024 * 1024, // 5MB
  error,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0]);
        onFileSelect(acceptedFiles[0]);
      }
    },
    onDropRejected: (rejectedFiles) => {
      toast.error('Invalid file. Please upload PDF or DOCX (max 5MB)');
    },
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          ${error ? 'border-error' : ''}
        `}
      >
        <input {...getInputProps()} />
        {file ? (
          <div>
            <FileIcon className="mx-auto h-12 w-12 text-primary-500" />
            <p className="mt-2 text-sm">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm">
              {isDragActive ? 'Drop file here' : 'Drag & drop or click to select'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF or DOCX, max 5MB
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-error mt-1">{error}</p>}
    </div>
  );
}
```

### 13.2. File Upload Service

```typescript
// src/services/fileService.ts
import api from './api';

export const fileService = {
  async uploadCV(jobId: string, file: File, coverLetter?: string) {
    const formData = new FormData();
    formData.append('cv', file);
    if (coverLetter) {
      formData.append('cover_letter', coverLetter);
    }

    const response = await api.post(`/jobs/${jobId}/apply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async uploadPaymentProof(transactionId: string, file: File) {
    const formData = new FormData();
    formData.append('proof', file);

    const response = await api.post(
      `/payments/${transactionId}/upload-proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  async downloadCV(applicationId: string) {
    const response = await api.get(`/files/cv/${applicationId}`, {
      responseType: 'blob',
    });

    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cv-${applicationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
```

---

## 14. ERROR HANDLING & VALIDATION

### 14.1. Error Handling Pattern

```typescript
// src/utils/errorHandler.ts
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export function handleApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || 'An error occurred';
    const errors = error.response?.data?.errors;

    if (errors) {
      // Validation errors
      Object.entries(errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => toast.error(`${field}: ${msg}`));
        }
      });
    } else {
      toast.error(message);
    }
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

### 14.2. Form Validation with Zod

```typescript
// src/schemas/jobSchema.ts
import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description_html: z.string().min(50, 'Description must be at least 50 characters'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  expires_at: z.string().optional(),
});

export type JobFormData = z.infer<typeof jobSchema>;
```

### 14.3. Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 15. MOCK DATA IMPLEMENTATION (COMPLETE)

### 15.1. Complete Mock Data Files

**applications.ts**
```typescript
import { Application } from '@/types';
import { mockJobs } from './jobs';
import { mockUsers } from './users';

export const mockApplications: Application[] = [
  {
    id: '880e8400-e29b-41d4-a716-446655440000',
    job_id: mockJobs[0].id,
    seeker_id: mockUsers.find(u => u.role === 'SEEKER')!.id,
    cv_path: 'cvs/sample_cv_1.pdf',
    cv_original_name: 'Alem_Seeker_CV.pdf',
    cover_letter: 'I am very interested in this position...',
    job: mockJobs[0],
    seeker: mockUsers.find(u => u.role === 'SEEKER'),
    created_at: '2025-01-15T00:00:00Z',
  },
  // ... more applications
];
```

**transactions.ts**
```typescript
import { Transaction } from '@/types';
import { mockProducts } from './products';
import { mockUsers } from './users';

export const mockTransactions: Transaction[] = [
  {
    id: '990e8400-e29b-41d4-a716-446655440000',
    user_id: mockUsers.find(u => u.role === 'LEARNER')!.id,
    product_id: mockProducts[0].id,
    gateway: 'MANUAL',
    gateway_ref: 'payments/990e8400-e29b-41d4-a716-446655440000/proof.jpg',
    amount: 500.00,
    status: 'PENDING_APPROVAL',
    user: mockUsers.find(u => u.role === 'LEARNER'),
    product: mockProducts[0],
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
  // ... more transactions
];
```

**adSlots.ts**
```typescript
import { AdSlot } from '@/types';

export const mockAdSlots: AdSlot[] = [
  {
    id: 1,
    position: 'HOME_HEADER',
    image_url: 'https://example.com/banners/home-header.jpg',
    target_url: 'https://example.com/promotion',
    is_active: true,
    impressions: 1250,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    position: 'SIDEBAR',
    image_url: 'https://example.com/banners/sidebar.jpg',
    target_url: 'https://example.com/course',
    is_active: true,
    impressions: 890,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // ... more ad slots
];
```

### 15.2. Complete Mock API Service

```typescript
// src/services/mockApi.ts (Complete)
import {
  mockUsers,
  mockJobs,
  mockProducts,
  mockApplications,
  mockTransactions,
  mockAdSlots,
} from '@/data/mock';
import type {
  User,
  JobPosting,
  Product,
  Application,
  Transaction,
  AdSlot,
  PaginatedResponse,
} from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // ========== AUTH ==========
  async login(email: string, password: string) {
    await delay(800);
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'password123') {
      throw new Error('Invalid credentials');
    }
    return {
      message: 'Login successful',
      user,
      token: 'mock_token_' + user.id,
    };
  },

  async signup(data: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'SEEKER' | 'EMPLOYER' | 'LEARNER';
  }) {
    await delay(1000);
    if (mockUsers.find(u => u.email === data.email)) {
      throw new Error('Email already exists');
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      ...data,
      role: data.role || 'SEEKER',
      subscription_tier: 'FREE',
      credits: 0,
      created_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return {
      message: 'User registered successfully',
      user: newUser,
      token: 'mock_token_' + newUser.id,
    };
  },

  async getUser() {
    await delay(300);
    return { user: mockUsers[0] }; // Return first user as logged in
  },

  async logout() {
    await delay(200);
    return { message: 'Logged out successfully' };
  },

  // ========== JOBS ==========
  async getJobs(params?: { q?: string; page?: number; status?: string }) {
    await delay(600);
    let jobs = [...mockJobs];

    if (params?.q) {
      const query = params.q.toLowerCase();
      jobs = jobs.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description_html.toLowerCase().includes(query)
      );
    }

    if (params?.status) {
      jobs = jobs.filter(job => job.status === params.status);
    }

    const page = params?.page || 1;
    const perPage = 15;
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      data: jobs.slice(start, end),
      meta: {
        current_page: page,
        last_page: Math.ceil(jobs.length / perPage),
        per_page: perPage,
        total: jobs.length,
      },
    } as PaginatedResponse<JobPosting>;
  },

  async getJob(id: string) {
    await delay(400);
    const job = mockJobs.find(j => j.id === id);
    if (!job) throw new Error('Job not found');
    return { data: job };
  },

  async createJob(data: {
    title: string;
    description_html: string;
    status?: string;
    expires_at?: string;
  }) {
    await delay(800);
    const newJob: JobPosting = {
      id: crypto.randomUUID(),
      employer_id: mockUsers.find(u => u.role === 'EMPLOYER')!.id,
      ...data,
      status: (data.status as any) || 'DRAFT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockJobs.push(newJob);
    return {
      message: 'Job posting created successfully',
      data: newJob,
    };
  },

  async updateJob(id: string, data: Partial<JobPosting>) {
    await delay(600);
    const index = mockJobs.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Job not found');
    mockJobs[index] = { ...mockJobs[index], ...data, updated_at: new Date().toISOString() };
    return {
      message: 'Job posting updated successfully',
      data: mockJobs[index],
    };
  },

  async deleteJob(id: string) {
    await delay(400);
    const index = mockJobs.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Job not found');
    mockJobs.splice(index, 1);
    return { message: 'Job posting deleted successfully' };
  },

  // ========== APPLICATIONS ==========
  async applyForJob(jobId: string, cv: File, coverLetter?: string) {
    await delay(1000);
    const newApplication: Application = {
      id: crypto.randomUUID(),
      job_id: jobId,
      seeker_id: mockUsers.find(u => u.role === 'SEEKER')!.id,
      cv_path: `cvs/${crypto.randomUUID()}.pdf`,
      cv_original_name: cv.name,
      cover_letter: coverLetter,
      job: mockJobs.find(j => j.id === jobId),
      seeker: mockUsers.find(u => u.role === 'SEEKER'),
      created_at: new Date().toISOString(),
    };
    mockApplications.push(newApplication);
    return {
      message: 'Application submitted successfully',
      data: newApplication,
    };
  },

  async getJobApplications(jobId: string, page?: number) {
    await delay(500);
    let applications = mockApplications.filter(a => a.job_id === jobId);
    const pageNum = page || 1;
    const perPage = 15;
    const start = (pageNum - 1) * perPage;
    const end = start + perPage;

    return {
      data: applications.slice(start, end),
      meta: {
        current_page: pageNum,
        last_page: Math.ceil(applications.length / perPage),
        per_page: perPage,
        total: applications.length,
      },
    } as PaginatedResponse<Application>;
  },

  // ========== PRODUCTS ==========
  async getProducts(params?: { type?: 'COURSE' | 'EBOOK'; page?: number }) {
    await delay(500);
    let products = [...mockProducts];

    if (params?.type) {
      products = products.filter(p => p.type === params.type);
    }

    const page = params?.page || 1;
    const perPage = 15;
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      data: products.slice(start, end),
      meta: {
        current_page: page,
        last_page: Math.ceil(products.length / perPage),
        per_page: perPage,
        total: products.length,
      },
    } as PaginatedResponse<Product>;
  },

  async getProduct(id: string) {
    await delay(300);
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return { data: product };
  },

  async getUserLibrary(page?: number) {
    await delay(400);
    // Return products that user has purchased
    const purchasedProducts = mockProducts.slice(0, 3); // Mock: first 3 products
    const pageNum = page || 1;
    const perPage = 15;

    return {
      data: purchasedProducts,
      meta: {
        current_page: pageNum,
        last_page: 1,
        per_page: perPage,
        total: purchasedProducts.length,
      },
    } as PaginatedResponse<Product>;
  },

  // ========== PAYMENTS ==========
  async initiatePayment(productId: string, amount: number) {
    await delay(800);
    const product = mockProducts.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');
    if (amount !== product.price_etb) {
      throw new Error('Amount does not match product price');
    }

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      user_id: mockUsers[0].id,
      product_id: productId,
      gateway: 'MANUAL',
      amount,
      status: 'PENDING',
      user: mockUsers[0],
      product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTransactions.push(transaction);

    return {
      message: 'Transaction created. Please upload payment proof.',
      data: transaction,
      instructions: 'Upload a screenshot or photo of your payment receipt.',
    };
  },

  async uploadPaymentProof(transactionId: string, proof: File) {
    await delay(1000);
    const transaction = mockTransactions.find(t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');

    transaction.gateway_ref = `payments/${transactionId}/proof.${proof.name.split('.').pop()}`;
    transaction.status = 'PENDING_APPROVAL';
    transaction.updated_at = new Date().toISOString();

    return {
      message: 'Payment proof uploaded successfully. Waiting for admin approval.',
      data: transaction,
    };
  },

  // ========== ADMIN - PAYMENTS ==========
  async getPendingPayments(page?: number) {
    await delay(500);
    const pending = mockTransactions.filter(t => t.status === 'PENDING_APPROVAL');
    const pageNum = page || 1;
    const perPage = 15;
    const start = (pageNum - 1) * perPage;
    const end = start + perPage;

    return {
      data: pending.slice(start, end),
      meta: {
        current_page: pageNum,
        last_page: Math.ceil(pending.length / perPage),
        per_page: perPage,
        total: pending.length,
      },
    } as PaginatedResponse<Transaction>;
  },

  async approvePayment(transactionId: string) {
    await delay(600);
    const transaction = mockTransactions.find(t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');
    transaction.status = 'APPROVED';
    transaction.updated_at = new Date().toISOString();

    return {
      message: 'Payment approved and access granted',
      data: transaction,
    };
  },

  async rejectPayment(transactionId: string, reason?: string) {
    await delay(600);
    const transaction = mockTransactions.find(t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');
    transaction.status = 'REJECTED';
    transaction.meta = { ...transaction.meta, rejection_reason: reason };
    transaction.updated_at = new Date().toISOString();

    return {
      message: 'Payment rejected',
      data: transaction,
    };
  },

  // ========== AD SLOTS ==========
  async getAds(position?: string) {
    await delay(300);
    let ads = mockAdSlots.filter(ad => ad.is_active);
    if (position) {
      ads = ads.filter(ad => ad.position === position);
    }
    // Increment impressions
    ads.forEach(ad => ad.impressions++);
    return { data: ads };
  },

  // ========== ADMIN - AD SLOTS ==========
  async getAdminAds(params?: { position?: string; is_active?: boolean; page?: number }) {
    await delay(400);
    let ads = [...mockAdSlots];

    if (params?.position) {
      ads = ads.filter(ad => ad.position === params.position);
    }
    if (params?.is_active !== undefined) {
      ads = ads.filter(ad => ad.is_active === params.is_active);
    }

    const page = params?.page || 1;
    const perPage = 15;
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      data: ads.slice(start, end).map(ad => ({
        id: ad.id,
        position: ad.position,
        image_url: ad.image_url,
        target_url: ad.target_url,
        is_active: ad.is_active,
        impressions: ad.impressions,
        created_at: ad.created_at,
        updated_at: ad.updated_at,
      })),
      meta: {
        current_page: page,
        last_page: Math.ceil(ads.length / perPage),
        per_page: perPage,
        total: ads.length,
      },
    };
  },

  async getAd(id: number) {
    await delay(300);
    const ad = mockAdSlots.find(a => a.id === id);
    if (!ad) throw new Error('Ad slot not found');
    return { data: ad };
  },

  async createAd(data: {
    position: string;
    image_url: string;
    target_url: string;
    is_active?: boolean;
  }) {
    await delay(600);
    const newAd: AdSlot = {
      id: mockAdSlots.length + 1,
      ...data,
      is_active: data.is_active ?? true,
      impressions: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockAdSlots.push(newAd);
    return {
      message: 'Ad slot created successfully',
      data: newAd,
    };
  },

  async updateAd(id: number, data: Partial<AdSlot>) {
    await delay(500);
    const index = mockAdSlots.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Ad slot not found');
    mockAdSlots[index] = { ...mockAdSlots[index], ...data, updated_at: new Date().toISOString() };
    return {
      message: 'Ad slot updated successfully',
      data: mockAdSlots[index],
    };
  },

  async deleteAd(id: number) {
    await delay(400);
    const index = mockAdSlots.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Ad slot not found');
    mockAdSlots.splice(index, 1);
    return { message: 'Ad slot deleted successfully' };
  },
};
```

---

## 16. BACKEND INTEGRATION GUIDE

### 16.1. Environment Configuration

**Create `.env` file:**
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=CyberBiz Africa
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 16.2. Switching from Mock to Real API

**Step 1: Create API Service Layer**

```typescript
// src/services/apiService.ts
import api from './api';
import { mockApi } from './mockApi';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const apiService = USE_MOCK_API ? mockApi : {
  // Real API implementations
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async signup(data: SignupRequest) {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async getJobs(params?: { q?: string; page?: number }) {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  // ... implement all other endpoints
};
```

**Step 2: Update Environment Variable**

```env
# Development with mock data
VITE_USE_MOCK_API=true

# Production with real API
VITE_USE_MOCK_API=false
VITE_API_URL=https://api.cyberbiz.africa/api
```

**Step 3: Update All Components**

Replace `mockApi` imports with `apiService`:

```typescript
// Before
import { mockApi } from '@/services/mockApi';
const jobs = await mockApi.getJobs();

// After
import { apiService } from '@/services/apiService';
const jobs = await apiService.getJobs();
```

### 16.3. CORS Configuration

Ensure backend allows frontend origin:

```php
// Laravel config/cors.php
'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://cyberbiz.africa',
],
```

### 16.4. Authentication Token Storage

```typescript
// Token is automatically handled by axios interceptor
// Stored in Zustand persist middleware (localStorage)
// Sent in Authorization header for all requests
```

---

## 17. PAGE SPECIFICATIONS

### 17.1. HomePage

**Layout:**
- Hero section with animated background
- Featured jobs carousel
- Featured products grid
- Ad banner (HOME_HEADER position)
- Call-to-action sections
- Footer

**Components:**
- `HeroSection` - Animated hero with search
- `FeaturedJobs` - Carousel of 6 featured jobs
- `FeaturedProducts` - Grid of 4 featured products
- `AdBanner` - Dynamic ad from API
- `StatsSection` - Platform statistics
- `CTASection` - Call-to-action buttons

**Animations:**
- Hero text fade-in on load
- Job cards slide-in on scroll
- Parallax effect on hero background

### 17.2. JobsPage

**Layout:**
- Search bar (sticky on scroll)
- Filters sidebar (collapsible on mobile)
- Job list with pagination
- Ad sidebar (SIDEBAR position)

**Components:**
- `JobSearchBar` - Search input with debounce
- `JobFilters` - Filter by location, type, salary
- `JobList` - Grid/list view toggle
- `JobCard` - Individual job card
- `Pagination` - Page navigation
- `AdSidebar` - Sidebar advertisement

**Features:**
- Real-time search
- Filter persistence in URL
- Infinite scroll option
- Save job functionality (if logged in)

### 17.3. JobDetailPage

**Layout:**
- Job header (title, company, apply button)
- Job description (HTML rendered)
- Company i