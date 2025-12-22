export type UserRole = 'ADMIN' | 'EMPLOYER' | 'SEEKER' | 'LEARNER';
export type SubscriptionTier = 'FREE' | 'PRO_EMPLOYER';
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TransactionStatus = 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export type ProductType = 'COURSE' | 'EBOOK';
export type ProductResourceType = 'VIDEO' | 'DOCUMENT' | 'FILE';
export type PaymentGateway = 'MANUAL' | 'CHAPA' | 'STRIPE';
export type AdPosition = 'HOME_HEADER' | 'SIDEBAR' | 'JOBS_BANNER' | 'FOOTER';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  credits: number;
  company_name?: string;
  website_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface JobPosting {
  id: string;
  employer_id: string;
  title: string;
  job_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  location?: string;
  experience?: string;
  skills?: string[];
  description_html: string;
  status: JobStatus;
  expires_at?: string;
  company_description?: string;
  json_ld?: string;
  employer?: User;
  applications_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  seeker_id: string;
  cv_path: string;
  cv_original_name: string;
  cover_letter?: string;
  job?: JobPosting;
  seeker?: User;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  description_html?: string;
  type: ProductType;
  price_etb: number;
  thumbnail_url?: string;
  content_path?: string;
  is_downloadable?: boolean;
  is_free?: boolean;
  resources?: ProductResource[];
  created_at: string;
  updated_at: string;
}

export interface ProductResource {
  id: string;
  product_id: string;
  type: ProductResourceType;
  title?: string;
  description?: string;
  file_path?: string;
  external_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  order: number;
  is_active: boolean;
  download_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  product_id: string;
  gateway: PaymentGateway;
  gateway_ref?: string;
  amount: number;
  status: TransactionStatus;
  meta?: Record<string, unknown>;
  user?: User;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export interface AdSlot {
  id: number;
  position: AdPosition;
  image_url: string;
  target_url: string;
  is_active: boolean;
  impressions: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  requires_phone?: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
