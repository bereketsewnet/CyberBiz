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
  Blog,
  BlogCategory,
  BlogComment,
  Newsletter,
  NewsletterSubscriber,
  Service,
  ServiceInquiry,
  NativeAd,
  SponsorshipPost,
  AffiliateProgram,
  AffiliateLink,
  AffiliateConversion,
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

  getSocialLoginUrl(provider: 'google' | 'facebook'): string {
    // OAuth routes are in web.php, not api.php, so remove /api from the URL
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const baseUrl = BASE_URL.replace('/api', '');
    return `${baseUrl}/auth/${provider}/redirect`;
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

  // ========== CONTACT ==========
  async sendContactMessage(data: {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
  }): Promise<{ message: string }> {
    return api.post<{ message: string }>('/contact', data);
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

  // ========== SETTINGS (PUBLIC) ==========
  async getPublicSiteSettings(): Promise<{
    data: {
      id: number;
      address?: string;
      email?: string;
      phone?: string;
      facebook_url?: string;
      twitter_url?: string;
      linkedin_url?: string;
      instagram_url?: string;
      youtube_url?: string;
      created_at: string;
      updated_at: string;
    };
  }> {
    return api.get('/settings');
  },

  // ========== ADMIN - STATS ==========
  async getAdminStats(): Promise<{
    data: {
      total_users: number;
      total_users_change: string;
      active_jobs: number;
      visible_jobs?: number;
      active_jobs_change: string;
      revenue_etb: number;
      revenue_change: string;
      conversion_rate: number;
      conversion_rate_change: string;
      pending_payments: number;
      active_ads: number;
      pending_password_resets?: number;
      recent_activities?: Array<{
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

  // ========== ADMIN - SETTINGS ==========
  async getSiteSettings(): Promise<{
    data: {
      id: number;
      address?: string;
      email?: string;
      phone?: string;
      facebook_url?: string;
      twitter_url?: string;
      linkedin_url?: string;
      instagram_url?: string;
      youtube_url?: string;
      created_at: string;
      updated_at: string;
    };
  }> {
    return api.get('/admin/settings');
  },

  async updateSiteSettings(data: {
    address?: string;
    email?: string;
    phone?: string;
    facebook_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    instagram_url?: string;
    youtube_url?: string;
  }): Promise<{
    message: string;
    data: {
      id: number;
      address?: string;
      email?: string;
      phone?: string;
      facebook_url?: string;
      twitter_url?: string;
      linkedin_url?: string;
      instagram_url?: string;
      youtube_url?: string;
      created_at: string;
      updated_at: string;
    };
  }> {
    return api.put('/admin/settings', data);
  },

  // ========== BLOGS ==========
  async getBlogs(params?: {
    page?: number;
    per_page?: number;
    q?: string;
    category_id?: number;
    status?: string;
  }): Promise<PaginatedResponse<Blog>> {
    return api.get('/blogs', params);
  },

  async getAdminBlogs(params?: {
    page?: number;
    per_page?: number;
    q?: string;
    category_id?: number;
    status?: string;
  }): Promise<PaginatedResponse<Blog>> {
    return api.get('/admin/blogs', params);
  },

  async getBlog(id: string): Promise<{ data: Blog }> {
    return api.get(`/blogs/${id}`);
  },

  async getAdminBlog(id: string): Promise<{ data: Blog }> {
    return api.get(`/admin/blogs/${id}`);
  },

  async getBlogCategories(): Promise<{ data: BlogCategory[] }> {
    return api.get('/blogs/categories/all');
  },

  async createBlog(data: {
    title: string;
    slug?: string;
    content: string;
    excerpt?: string;
    featured_image_url?: string;
    featured_image?: File;
    category_id?: number;
    published_at?: string;
    status: 'draft' | 'published';
    meta_title?: string;
    meta_description?: string;
  }): Promise<{ message: string; data: Blog }> {
    // Use FormData if file is present, otherwise use JSON
    if (data.featured_image) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('status', data.status);
      if (data.slug) formData.append('slug', data.slug);
      if (data.excerpt) formData.append('excerpt', data.excerpt);
      formData.append('featured_image', data.featured_image);
      if (data.featured_image_url) formData.append('featured_image_url', data.featured_image_url);
      if (data.category_id) formData.append('category_id', data.category_id.toString());
      if (data.published_at) formData.append('published_at', data.published_at);
      if (data.meta_title) formData.append('meta_title', data.meta_title);
      if (data.meta_description) formData.append('meta_description', data.meta_description);
      return api.post('/admin/blogs', formData);
    } else {
      return api.post('/admin/blogs', data);
    }
  },

  async updateBlog(id: string, data: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featured_image_url?: string;
    featured_image?: File;
    category_id?: number;
    published_at?: string;
    status?: 'draft' | 'published';
    meta_title?: string;
    meta_description?: string;
  }): Promise<{ message: string; data: Blog }> {
    // Always use FormData for updates (Laravel doesn't parse FormData correctly with PUT)
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.content !== undefined) formData.append('content', data.content);
    if (data.status !== undefined) formData.append('status', data.status);
    if (data.slug !== undefined) formData.append('slug', data.slug || '');
    if (data.excerpt !== undefined) formData.append('excerpt', data.excerpt || '');
    if (data.featured_image) formData.append('featured_image', data.featured_image);
    if (data.featured_image_url !== undefined) formData.append('featured_image_url', data.featured_image_url || '');
    if (data.category_id !== undefined) formData.append('category_id', data.category_id.toString());
    if (data.published_at !== undefined) formData.append('published_at', data.published_at || '');
    if (data.meta_title !== undefined) formData.append('meta_title', data.meta_title || '');
    if (data.meta_description !== undefined) formData.append('meta_description', data.meta_description || '');
    // Use POST endpoint for FormData updates (Laravel doesn't parse FormData correctly with PUT)
    return api.post<{ message: string; data: Blog }>(`/admin/blogs/${id}/update`, formData);
  },

  async deleteBlog(id: string): Promise<{ message: string }> {
    return api.delete(`/admin/blogs/${id}`);
  },

  // ========== BLOG COMMENTS ==========
  async getBlogComments(blogId: string): Promise<{ data: BlogComment[] }> {
    return api.get(`/blogs/${blogId}/comments`);
  },

  async createBlogComment(blogId: string, data: {
    content: string;
    parent_id?: number;
  }): Promise<{ message: string; data: BlogComment }> {
    return api.post(`/blogs/${blogId}/comments`, data);
  },

  async updateBlogComment(commentId: string, data: {
    content: string;
  }): Promise<{ message: string; data: BlogComment }> {
    return api.put(`/comments/${commentId}`, data);
  },

  async deleteBlogComment(commentId: string): Promise<{ message: string }> {
    return api.delete(`/comments/${commentId}`);
  },

  // ========== NEWSLETTER ==========
  async subscribeNewsletter(data: {
    email: string;
    name?: string;
  }): Promise<{ message: string }> {
    return api.post('/newsletter/subscribe', data);
  },

  async unsubscribeNewsletter(email: string): Promise<{ message: string }> {
    return api.post('/newsletter/unsubscribe', { email });
  },

  async getNewsletters(params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Newsletter>> {
    return api.get('/admin/newsletters', params);
  },

  async createNewsletter(data: {
    subject: string;
    content: string;
  }): Promise<{ message: string; data: Newsletter }> {
    return api.post('/admin/newsletters', data);
  },

  async sendNewsletter(newsletterId: string, subscriberIds?: number[]): Promise<{ message: string; data: { recipient_count: number; failed_count?: number } }> {
    const data: any = {};
    if (subscriberIds && subscriberIds.length > 0) {
      data.subscriber_ids = subscriberIds;
    }
    return api.post(`/admin/newsletters/${newsletterId}/send`, data);
  },

  async deleteNewsletter(newsletterId: string): Promise<{ message: string }> {
    return api.delete(`/admin/newsletters/${newsletterId}`);
  },

  async getNewsletterSubscribers(params?: {
    page?: number;
    per_page?: number;
    status?: 'subscribed' | 'unsubscribed';
    q?: string;
  }): Promise<PaginatedResponse<NewsletterSubscriber>> {
    return api.get('/admin/newsletters/subscribers', params);
  },

  async deleteNewsletterSubscriber(subscriberId: string): Promise<{ message: string }> {
    return api.delete(`/admin/newsletters/subscribers/${subscriberId}`);
  },

  // ========== SERVICES ==========
  async getServices(): Promise<{ data: Service[] }> {
    return api.get('/services');
  },

  async getService(idOrSlug: string): Promise<{ data: Service }> {
    return api.get(`/services/${idOrSlug}`);
  },

  async submitServiceInquiry(serviceId: string, data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message: string;
  }): Promise<{ message: string; data: ServiceInquiry }> {
    return api.post(`/services/${serviceId}/inquiry`, data);
  },

  async getAdminServices(): Promise<{ data: Service[] }> {
    return api.get('/admin/services');
  },

  async createService(data: {
    title: string;
    slug?: string;
    description: string;
    content?: string;
    icon?: string;
    image_url?: string;
    order?: number;
    is_active?: boolean;
    meta_title?: string;
    meta_description?: string;
  }): Promise<{ message: string; data: Service }> {
    return api.post('/admin/services', data);
  },

  async updateService(id: string, data: {
    title?: string;
    slug?: string;
    description?: string;
    content?: string;
    icon?: string;
    image_url?: string;
    order?: number;
    is_active?: boolean;
    meta_title?: string;
    meta_description?: string;
  }): Promise<{ message: string; data: Service }> {
    return api.put(`/admin/services/${id}`, data);
  },

  async deleteService(id: string): Promise<{ message: string }> {
    return api.delete(`/admin/services/${id}`);
  },

  async getServiceInquiries(params?: {
    page?: number;
    per_page?: number;
    service_id?: number;
    status?: string;
    q?: string;
  }): Promise<PaginatedResponse<ServiceInquiry>> {
    return api.get('/admin/services/inquiries', params);
  },

  async updateServiceInquiry(inquiryId: string, data: {
    status?: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
    admin_notes?: string;
    assigned_to?: string;
  }): Promise<{ message: string; data: ServiceInquiry }> {
    return api.put(`/admin/services/inquiries/${inquiryId}`, data);
  },

  async deleteServiceInquiry(inquiryId: string): Promise<{ message: string }> {
    return api.delete(`/admin/services/inquiries/${inquiryId}`);
  },

  // ========== NATIVE ADS ==========
  async getNativeAds(params?: {
    position?: 'content_inline' | 'sidebar' | 'footer' | 'between_posts' | 'after_content';
    limit?: number;
  }): Promise<{ data: NativeAd[] }> {
    return api.get('/native-ads', params);
  },

  async trackNativeAdClick(adId: string): Promise<{ message: string; redirect_url: string }> {
    return api.post(`/native-ads/${adId}/click`);
  },

  async getAdminNativeAds(params?: {
    page?: number;
    per_page?: number;
    position?: string;
    type?: string;
    is_active?: boolean;
    q?: string;
  }): Promise<PaginatedResponse<NativeAd>> {
    return api.get('/admin/native-ads', params);
  },

  async getAdminNativeAd(id: string): Promise<{ data: NativeAd }> {
    return api.get(`/admin/native-ads/${id}`);
  },

  async createNativeAd(data: {
    title: string;
    description?: string;
    image_url?: string;
    link_url: string;
    position: 'content_inline' | 'sidebar' | 'footer' | 'between_posts' | 'after_content';
    type: 'sponsored' | 'advertisement' | 'promoted';
    advertiser_name?: string;
    is_active?: boolean;
    start_date?: string;
    end_date?: string;
    priority?: number;
  }): Promise<{ message: string; data: NativeAd }> {
    return api.post('/admin/native-ads', data);
  },

  async updateNativeAd(id: string, data: {
    title?: string;
    description?: string;
    image_url?: string;
    link_url?: string;
    position?: 'content_inline' | 'sidebar' | 'footer' | 'between_posts' | 'after_content';
    type?: 'sponsored' | 'advertisement' | 'promoted';
    advertiser_name?: string;
    is_active?: boolean;
    start_date?: string;
    end_date?: string;
    priority?: number;
  }): Promise<{ message: string; data: NativeAd }> {
    return api.put(`/admin/native-ads/${id}`, data);
  },

  async deleteNativeAd(id: string): Promise<{ message: string }> {
    return api.delete(`/admin/native-ads/${id}`);
  },

  async resetNativeAdStats(id: string): Promise<{ message: string; data: NativeAd }> {
    return api.post(`/admin/native-ads/${id}/reset-stats`);
  },

  // ========== SPONSORSHIP POSTS ==========
  async getSponsorshipPosts(params?: {
    page?: number;
    per_page?: number;
    q?: string;
  }): Promise<PaginatedResponse<SponsorshipPost>> {
    return api.get('/sponsorship-posts', params);
  },

  async getSponsorshipPost(idOrSlug: string): Promise<{ data: SponsorshipPost }> {
    return api.get(`/sponsorship-posts/${idOrSlug}`);
  },

  async getAdminSponsorshipPosts(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    q?: string;
  }): Promise<PaginatedResponse<SponsorshipPost>> {
    return api.get('/admin/sponsorship-posts', params);
  },

  async getAdminSponsorshipPost(id: string): Promise<{ data: SponsorshipPost }> {
    return api.get(`/admin/sponsorship-posts/${id}`);
  },

  async createSponsorshipPost(data: {
    title: string;
    slug?: string;
    content: string;
    excerpt?: string;
    featured_image_url?: string;
    sponsor_name: string;
    sponsor_logo_url?: string;
    sponsor_website?: string;
    sponsor_description?: string;
    status: 'draft' | 'published' | 'archived';
    published_at?: string;
    expires_at?: string;
    priority?: number;
    meta_title?: string;
    meta_description?: string;
  }): Promise<{ message: string; data: SponsorshipPost }> {
    return api.post('/admin/sponsorship-posts', data);
  },

  async updateSponsorshipPost(id: string, data: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featured_image_url?: string;
    sponsor_name?: string;
    sponsor_logo_url?: string;
    sponsor_website?: string;
    sponsor_description?: string;
    status?: 'draft' | 'published' | 'archived';
    published_at?: string;
    expires_at?: string;
    priority?: number;
    meta_title?: string;
    meta_description?: string;
  }): Promise<{ message: string; data: SponsorshipPost }> {
    return api.put(`/admin/sponsorship-posts/${id}`, data);
  },

  async deleteSponsorshipPost(id: string): Promise<{ message: string }> {
    return api.delete(`/admin/sponsorship-posts/${id}`);
  },

  // ========== AFFILIATE ==========
  async getAffiliatePrograms(): Promise<{ data: AffiliateProgram[] }> {
    return api.get('/affiliate/programs');
  },

  async trackAffiliateClick(code: string): Promise<{ message: string; redirect_url: string; link_id: number }> {
    return api.get(`/affiliate/click/${code}`);
  },

  async trackAffiliateConversion(data: {
    transaction_id: string;
    amount: number;
    affiliate_code?: string;
  }): Promise<{ message: string; data: AffiliateConversion }> {
    return api.post('/affiliate/conversion', data);
  },

  async getAffiliateDashboard(): Promise<{
    data: {
      links: AffiliateLink[];
      stats: {
        total_links: number;
        total_clicks: number;
        total_conversions: number;
        total_commission: number;
        pending_commission: number;
        paid_commission: number;
      };
    };
  }> {
    return api.get('/affiliate/dashboard');
  },

  async joinAffiliateProgram(programId: string): Promise<{ message: string; data: AffiliateLink }> {
    return api.post(`/affiliate/programs/${programId}/join`);
  },

  async getAdminAffiliatePrograms(): Promise<{ data: AffiliateProgram[] }> {
    return api.get('/admin/affiliate/programs');
  },

  async createAffiliateProgram(data: {
    name: string;
    description?: string;
    type: 'percentage' | 'fixed';
    commission_rate: number;
    target_url: string;
    is_active?: boolean;
    cookie_duration?: number;
  }): Promise<{ message: string; data: AffiliateProgram }> {
    return api.post('/admin/affiliate/programs', data);
  },

  async updateAffiliateProgram(id: string, data: {
    name?: string;
    description?: string;
    type?: 'percentage' | 'fixed';
    commission_rate?: number;
    target_url?: string;
    is_active?: boolean;
    cookie_duration?: number;
  }): Promise<{ message: string; data: AffiliateProgram }> {
    return api.put(`/admin/affiliate/programs/${id}`, data);
  },

  async deleteAffiliateProgram(id: string): Promise<{ message: string }> {
    return api.delete(`/admin/affiliate/programs/${id}`);
  },

  async getAdminAffiliateLinks(params?: {
    page?: number;
    per_page?: number;
    program_id?: number;
    affiliate_id?: string;
  }): Promise<PaginatedResponse<AffiliateLink>> {
    return api.get('/admin/affiliate/links', params);
  },

  async getAdminAffiliateConversions(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    link_id?: number;
  }): Promise<PaginatedResponse<AffiliateConversion>> {
    return api.get('/admin/affiliate/conversions', params);
  },

  async updateAffiliateConversion(id: string, data: {
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    notes?: string;
  }): Promise<{ message: string; data: AffiliateConversion }> {
    return api.put(`/admin/affiliate/conversions/${id}`, data);
  },

  async getAdminAffiliateStats(): Promise<{
    data: {
      total_programs: number;
      active_programs: number;
      total_links: number;
      active_links: number;
      total_clicks: number;
      total_conversions: number;
      total_commission: number;
      pending_commission: number;
      paid_commission: number;
    };
  }> {
    return api.get('/admin/affiliate/stats');
  },
};
