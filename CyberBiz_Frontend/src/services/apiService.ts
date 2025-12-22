import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type {
  User,
  JobPosting,
  Product,
  ProductResource,
  Application,
  Transaction,
  AdSlot,
  PaginatedResponse,
  AuthResponse,
} from '@/types';

export const apiService = {
  // ========== AUTH ==========
  async login(email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', { email, password });
  },

  async signup(data: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    role?: 'SEEKER' | 'EMPLOYER' | 'LEARNER';
  }): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/signup', data);
  },

  async getUser(): Promise<{ user: User }> {
    return api.get<{ user: User }>('/auth/user');
  },

  async logout(): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/logout');
  },

  async updateProfile(data: {
    full_name?: string;
    phone?: string;
    company_name?: string;
    website_url?: string;
    password?: string;
  }): Promise<{ message: string; user: User }> {
    return api.put<{ message: string; user: User }>('/auth/profile', data);
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  },

  // ========== JOBS ==========
  async getJobs(params?: { q?: string; page?: number; status?: string; my_jobs?: boolean; job_type?: string; location?: string; experience?: string }): Promise<PaginatedResponse<JobPosting>> {
    return api.get<PaginatedResponse<JobPosting>>('/jobs', params);
  },

  async getJob(id: string): Promise<{ data: JobPosting }> {
    return api.get<{ data: JobPosting }>(`/jobs/${id}`);
  },

  async createJob(data: {
    title: string;
    job_type?: string;
    location?: string;
    experience?: string;
    skills?: string[];
    description?: string;
    description_html?: string;
    status?: string;
    expires_at?: string;
    company_description?: string;
    website_url?: string;
  }): Promise<{ message: string; data: JobPosting }> {
    return api.post<{ message: string; data: JobPosting }>('/jobs', data);
  },

  async updateJob(id: string, data: Partial<JobPosting>): Promise<{ message: string; data: JobPosting }> {
    return api.put<{ message: string; data: JobPosting }>(`/jobs/${id}`, data);
  },

  async deleteJob(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/jobs/${id}`);
  },

  // ========== APPLICATIONS ==========
  async applyForJob(jobId: string, cv: File, coverLetter?: string): Promise<{ message: string; data: Application }> {
    const formData = new FormData();
    formData.append('cv', cv);
    if (coverLetter) {
      formData.append('cover_letter', coverLetter);
    }
    return api.post<{ message: string; data: Application }>(`/jobs/${jobId}/apply`, formData);
  },

  async getJobApplications(jobId: string, page?: number): Promise<PaginatedResponse<Application>> {
    return api.get<PaginatedResponse<Application>>(`/jobs/${jobId}/applications`, { page });
  },

  async getMyApplications(page?: number): Promise<PaginatedResponse<Application>> {
    return api.get<PaginatedResponse<Application>>('/user/applications', { page });
  },

  // ========== JOB FAVORITES ==========
  async toggleJobFavorite(jobId: string): Promise<{ message: string; is_favorite: boolean }> {
    return api.post<{ message: string; is_favorite: boolean }>(`/jobs/${jobId}/favorite`);
  },

  async checkJobFavorite(jobId: string): Promise<{ is_favorite: boolean }> {
    return api.get<{ is_favorite: boolean }>(`/jobs/${jobId}/favorite`);
  },

  async getMyFavorites(page?: number): Promise<{ data: { id: string; job: JobPosting; created_at: string }[] }> {
    const response = await api.get<{ data: { id: string; job: JobPosting; created_at: string }[]; meta?: any }>('/user/favorites', { page });
    // Handle both paginated and non-paginated responses
    return {
      data: Array.isArray(response.data) ? response.data : (response as any).data || [],
    };
  },

  async downloadCV(applicationId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${api.baseUrl}/files/cv/${applicationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to download CV');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-${applicationId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // ========== PRODUCTS ==========
  async getProducts(params?: { type?: 'COURSE' | 'EBOOK'; page?: number; q?: string }): Promise<PaginatedResponse<Product>> {
    return api.get<PaginatedResponse<Product>>('/products', params);
  },

  async getProduct(id: string): Promise<{ data: Product }> {
    return api.get<{ data: Product }>(`/products/${id}`);
  },

  async getUserLibrary(page?: number): Promise<PaginatedResponse<Product>> {
    return api.get<PaginatedResponse<Product>>('/user/library', { page });
  },

  async claimFreeProduct(productId: string): Promise<{ message: string; data: Product }> {
    return api.post<{ message: string; data: Product }>(`/products/${productId}/claim-free`);
  },

  // ========== PAYMENTS ==========
  async initiatePayment(productId: string, amount: number): Promise<{ message: string; data: Transaction; instructions: string }> {
    return api.post<{ message: string; data: Transaction; instructions: string }>('/payments/manual-initiate', {
      product_id: productId,
      amount,
    });
  },

  async uploadPaymentProof(transactionId: string, proof: File): Promise<{ message: string; data: Transaction }> {
    const formData = new FormData();
    formData.append('proof', proof);
    return api.post<{ message: string; data: Transaction }>(`/payments/${transactionId}/upload-proof`, formData);
  },

  // ========== ADMIN - PAYMENTS ==========
  async getPendingPayments(page?: number): Promise<PaginatedResponse<Transaction>> {
    return api.get<PaginatedResponse<Transaction>>('/admin/payments/pending', { page });
  },

  async approvePayment(transactionId: string): Promise<{ message: string; data: Transaction }> {
    return api.post<{ message: string; data: Transaction }>(`/admin/payments/${transactionId}/approve`);
  },

  async rejectPayment(transactionId: string, reason?: string): Promise<{ message: string; data: Transaction }> {
    return api.post<{ message: string; data: Transaction }>(`/admin/payments/${transactionId}/reject`, { reason });
  },

  async downloadPaymentProof(transactionId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${api.baseUrl}/admin/files/proof/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to download proof');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proof-${transactionId}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // ========== AD SLOTS ==========
  async getAds(position?: string): Promise<{ data: AdSlot[] }> {
    return api.get<{ data: AdSlot[] }>('/ads', { position });
  },

  // ========== ADMIN - AD SLOTS ==========
  async getAdminAds(params?: { position?: string; is_active?: boolean; page?: number }): Promise<PaginatedResponse<AdSlot>> {
    return api.get<PaginatedResponse<AdSlot>>('/admin/ads', params as Record<string, string | number | boolean | undefined>);
  },

  async getAd(id: number): Promise<{ data: AdSlot }> {
    return api.get<{ data: AdSlot }>(`/admin/ads/${id}`);
  },

  async createAd(data: {
    position: string;
    image?: File;
    image_url?: string;
    target_url: string;
    is_active?: boolean;
  }): Promise<{ message: string; data: AdSlot }> {
    // Check if we have a file to upload
    if (data.image) {
      const formData = new FormData();
      formData.append('position', data.position);
      formData.append('target_url', data.target_url);
      if (data.image) {
        formData.append('image', data.image);
      }
      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active ? '1' : '0');
      }
      return api.post<{ message: string; data: AdSlot }>('/admin/ads', formData);
    } else {
      // Use JSON if no file
      return api.post<{ message: string; data: AdSlot }>('/admin/ads', {
        position: data.position,
        image_url: data.image_url,
        target_url: data.target_url,
        is_active: data.is_active,
      });
    }
  },

  async updateAd(id: number, data: {
    position?: string;
    image?: File;
    image_url?: string;
    target_url?: string;
    is_active?: boolean;
  }): Promise<{ message: string; data: AdSlot }> {
    // Check if we have a file to upload
    if (data.image) {
      const formData = new FormData();
      if (data.position) formData.append('position', data.position);
      if (data.target_url) formData.append('target_url', data.target_url);
      if (data.image) {
        formData.append('image', data.image);
      }
      if (data.image_url !== undefined) {
        formData.append('image_url', data.image_url);
      }
      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active ? '1' : '0');
      }
      // Use POST endpoint for FormData updates (Laravel doesn't parse FormData correctly with PUT)
      return api.post<{ message: string; data: AdSlot }>(`/admin/ads/${id}/update`, formData);
    } else {
      // Use JSON if no file
      const updateData: any = {};
      if (data.position) updateData.position = data.position;
      if (data.image_url !== undefined) updateData.image_url = data.image_url;
      if (data.target_url) updateData.target_url = data.target_url;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      return api.put<{ message: string; data: AdSlot }>(`/admin/ads/${id}`, updateData);
    }
  },

  async deleteAd(id: number): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/admin/ads/${id}`);
  },

  // ========== STATS ==========
  async getStats(): Promise<{ data: { active_jobs: number; companies: number; job_seekers: number; success_rate: number } }> {
    return api.get<{ data: { active_jobs: number; companies: number; job_seekers: number; success_rate: number } }>('/stats');
  },

  // ========== ADMIN - STATS ==========
  async getAdminStats(): Promise<{
    data: {
      total_users: number;
      total_users_change: string;
      active_jobs: number;
      active_jobs_change: string;
      revenue_etb: number;
      revenue_change: string;
      conversion_rate: number;
      conversion_rate_change: string;
      pending_payments: number;
      active_ads: number;
      recent_activities: Array<{
        type: string;
        action: string;
        user: string;
        time: string;
        created_at: string;
      }>;
    };
  }> {
    return api.get('/admin/stats');
  },

  // ========== ADMIN - USERS ==========
  async getAdminUsers(params?: { role?: string; q?: string; page?: number }): Promise<PaginatedResponse<User>> {
    return api.get<PaginatedResponse<User>>('/admin/users', params);
  },

  async getAdminUser(id: string): Promise<{ data: User }> {
    return api.get<{ data: User }>(`/admin/users/${id}`);
  },

  async updateAdminUser(id: string, data: Partial<User>): Promise<{ message: string; data: User }> {
    return api.put<{ message: string; data: User }>(`/admin/users/${id}`, data);
  },

  async deleteAdminUser(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/admin/users/${id}`);
  },

  async resetAdminUserPassword(id: string, password: string): Promise<{ message: string; data: User }> {
    return api.post<{ message: string; data: User }>(`/admin/users/${id}/reset-password`, { password });
  },

  // ========== ADMIN - PRODUCTS ==========
  async getAdminProducts(params?: { type?: 'COURSE' | 'EBOOK'; q?: string; page?: number }): Promise<PaginatedResponse<Product>> {
    return api.get<PaginatedResponse<Product>>('/admin/products', params);
  },

  async getAdminProduct(id: string): Promise<{ data: Product }> {
    return api.get<{ data: Product }>(`/admin/products/${id}`);
  },

  async createAdminProduct(data: {
    title: string;
    description?: string;
    description_html?: string;
    type: 'COURSE' | 'EBOOK';
    price_etb: number;
    thumbnail_url?: string;
    thumbnail?: File;
    content_path?: string;
    is_downloadable?: boolean;
    is_free?: boolean;
  }): Promise<{ message: string; data: Product }> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description_html) {
      formData.append('description_html', data.description_html);
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('type', data.type);
    formData.append('price_etb', data.price_etb.toString());
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    } else if (data.thumbnail_url) {
      formData.append('thumbnail_url', data.thumbnail_url);
    }
    if (data.content_path) {
      formData.append('content_path', data.content_path);
    }
    if (data.is_downloadable !== undefined) {
      formData.append('is_downloadable', data.is_downloadable ? '1' : '0');
    }
    if (data.is_free !== undefined) {
      formData.append('is_free', data.is_free ? '1' : '0');
    }
    return api.post<{ message: string; data: Product }>('/admin/products', formData);
  },

  async updateAdminProduct(id: string, data: {
    title?: string;
    description?: string;
    description_html?: string;
    type?: 'COURSE' | 'EBOOK';
    price_etb?: number;
    thumbnail_url?: string;
    thumbnail?: File;
    content_path?: string;
    is_downloadable?: boolean;
    is_free?: boolean;
  }): Promise<{ message: string; data: Product }> {
    const formData = new FormData();
    // Always include required fields if they exist in data
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.description_html !== undefined) formData.append('description_html', data.description_html);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.type !== undefined) formData.append('type', data.type);
    if (data.price_etb !== undefined) formData.append('price_etb', data.price_etb.toString());
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    } else if (data.thumbnail_url !== undefined) {
      formData.append('thumbnail_url', data.thumbnail_url || '');
    }
    if (data.content_path !== undefined) {
      formData.append('content_path', data.content_path || '');
    }
    if (data.is_downloadable !== undefined) {
      formData.append('is_downloadable', data.is_downloadable ? '1' : '0');
    }
    if (data.is_free !== undefined) {
      formData.append('is_free', data.is_free ? '1' : '0');
    }
    
    // Use POST endpoint for FormData updates (Laravel doesn't parse FormData correctly with PUT)
    return api.post<{ message: string; data: Product }>(`/admin/products/${id}/update`, formData);
  },

  async deleteAdminProduct(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/admin/products/${id}`);
  },

  // ========== ADMIN - JOBS ==========
  async getAdminJobs(params?: { q?: string; status?: string; page?: number }): Promise<PaginatedResponse<JobPosting>> {
    return api.get<PaginatedResponse<JobPosting>>('/admin/jobs', params);
  },

  // ========== ADMIN - PRODUCT RESOURCES ==========
  async getProductResources(productId: string): Promise<{ data: ProductResource[] }> {
    return api.get<{ data: ProductResource[] }>(`/admin/products/${productId}/resources`);
  },

  async createProductResource(productId: string, data: FormData): Promise<{ message: string; data: ProductResource }> {
    return api.post<{ message: string; data: ProductResource }>(`/admin/products/${productId}/resources`, data);
  },

  async updateProductResource(productId: string, resourceId: string, data: FormData): Promise<{ message: string; data: ProductResource }> {
    // Use POST endpoint for FormData updates
    data.append('_method', 'PUT');
    return api.post<{ message: string; data: ProductResource }>(`/admin/products/${productId}/resources/${resourceId}/update`, data);
  },

  async deleteProductResource(productId: string, resourceId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/admin/products/${productId}/resources/${resourceId}`);
  },

  async reorderProductResources(productId: string, resourceIds: string[]): Promise<{ message: string; data: ProductResource[] }> {
    return api.post<{ message: string; data: ProductResource[] }>(`/admin/products/${productId}/resources/reorder`, {
      resource_ids: resourceIds,
    });
  },

  // ========== PRODUCT RESOURCES (PUBLIC - requires access) ==========
  async getUserProductResources(productId: string): Promise<{ data: ProductResource[] }> {
    return api.get<{ data: ProductResource[] }>(`/products/${productId}/resources`);
  },

  async viewProductResource(productId: string, resourceId: string): Promise<Blob> {
    const response = await fetch(`${api.baseUrl}/products/${productId}/resources/${resourceId}/view`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load resource');
    }

    return response.blob();
  },

  async downloadProductResource(productId: string, resourceId: string): Promise<Blob> {
    const response = await fetch(`${api.baseUrl}/products/${productId}/resources/${resourceId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
        'Accept': 'application/octet-stream',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download resource');
    }

    return response.blob();
  },
};
