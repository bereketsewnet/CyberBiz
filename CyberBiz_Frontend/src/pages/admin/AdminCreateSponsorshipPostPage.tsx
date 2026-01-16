import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

export default function AdminCreateSponsorshipPostPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    sponsor_name: '',
    sponsor_logo_url: '',
    sponsor_website: '',
    sponsor_description: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    published_at: '',
    expires_at: '',
    priority: 0,
    meta_title: '',
    meta_description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [sponsorLogoFile, setSponsorLogoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.sponsor_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    setErrors({});
    try {
      const submitData: any = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        sponsor_name: formData.sponsor_name.trim(),
        status: formData.status,
      };

      // Only include optional fields if they have values
      if (formData.slug && formData.slug.trim()) submitData.slug = formData.slug.trim();
      if (formData.excerpt && formData.excerpt.trim()) submitData.excerpt = formData.excerpt.trim();
      if (featuredImageFile) {
        submitData.featured_image = featuredImageFile;
      }
      // Always include featured_image_url (even if empty)
      submitData.featured_image_url = formData.featured_image_url ? formData.featured_image_url.trim() : '';
      if (sponsorLogoFile) {
        submitData.sponsor_logo = sponsorLogoFile;
      }
      // Always include sponsor_logo_url (even if empty)
      submitData.sponsor_logo_url = formData.sponsor_logo_url ? formData.sponsor_logo_url.trim() : '';
      if (formData.sponsor_website && formData.sponsor_website.trim()) submitData.sponsor_website = formData.sponsor_website.trim();
      if (formData.sponsor_description && formData.sponsor_description.trim()) submitData.sponsor_description = formData.sponsor_description.trim();
      if (formData.published_at) submitData.published_at = formData.published_at;
      if (formData.expires_at) submitData.expires_at = formData.expires_at;
      if (formData.priority !== undefined) submitData.priority = formData.priority;
      if (formData.meta_title && formData.meta_title.trim()) submitData.meta_title = formData.meta_title.trim();
      if (formData.meta_description && formData.meta_description.trim()) submitData.meta_description = formData.meta_description.trim();

      await apiService.createSponsorshipPost(submitData);
      toast.success('Sponsorship post created successfully!');
      navigate('/admin/sponsorship-posts');
    } catch (error: any) {
      if (error.errors) {
        const formattedErrors: Record<string, string[]> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            formattedErrors[field] = messages;
          } else if (typeof messages === 'string') {
            formattedErrors[field] = [messages];
          } else if (typeof messages === 'object' && messages !== null) {
            formattedErrors[field] = [String(messages)];
          }
        });
        setErrors(formattedErrors);
        const errorMessages: string[] = [];
        Object.entries(formattedErrors).forEach(([field, messages]) => {
          messages.forEach((msg: string) => {
            errorMessages.push(`${field}: ${msg}`);
          });
        });
        toast.error(errorMessages.slice(0, 3).join(', ') + (errorMessages.length > 3 ? '...' : ''));
      } else {
        toast.error(error.message || 'Failed to create sponsorship post');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/sponsorship-posts')}
              className="mb-6 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sponsorship Posts
            </Button>

            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Create Sponsorship Post
            </h1>
            <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Create a new sponsored content post
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (errors.title) setErrors({ ...errors, title: [] });
                    }}
                    placeholder="Post title"
                    className={`mt-1 border-slate-300 ${errors.title ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.title && errors.title.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{errors.title[0]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">Slug (optional)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData({ ...formData, slug: e.target.value });
                      if (errors.slug) setErrors({ ...errors, slug: [] });
                    }}
                    placeholder="post-slug"
                    className={`mt-1 border-slate-300 ${errors.slug ? 'border-red-500' : ''}`}
                  />
                  {errors.slug && errors.slug.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{errors.slug[0]}</p>
                  )}
                  <p className="text-sm text-slate-500 mt-1">Leave empty to auto-generate from title</p>
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => {
                      setFormData({ ...formData, content: e.target.value });
                      if (errors.content) setErrors({ ...errors, content: [] });
                    }}
                    placeholder="Post content (HTML supported)"
                    rows={15}
                    className={`mt-1 border-slate-300 font-mono text-sm ${errors.content ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.content && errors.content.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{errors.content[0]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt (optional)</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => {
                      setFormData({ ...formData, excerpt: e.target.value });
                      if (errors.excerpt) setErrors({ ...errors, excerpt: [] });
                    }}
                    placeholder="Brief excerpt/summary"
                    rows={3}
                    className={`mt-1 border-slate-300 ${errors.excerpt ? 'border-red-500' : ''}`}
                  />
                  {errors.excerpt && errors.excerpt.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{errors.excerpt[0]}</p>
                  )}
                </div>

                <div>
                  <Label>Featured Image (optional)</Label>
                  <FileUpload
                    value={formData.featured_image_url}
                    onChange={(file, url) => {
                      setFeaturedImageFile(file);
                      setFormData({ ...formData, featured_image_url: url || '' });
                      if (errors.featured_image || errors.featured_image_url) {
                        const newErrors = { ...errors };
                        delete newErrors.featured_image;
                        delete newErrors.featured_image_url;
                        setErrors(newErrors);
                      }
                    }}
                    onUrlChange={(url) => {
                      setFormData({ ...formData, featured_image_url: url });
                      setFeaturedImageFile(null);
                      if (errors.featured_image_url) setErrors({ ...errors, featured_image_url: [] });
                    }}
                    label=""
                    showUrlInput={true}
                    accept="image/*"
                    maxSize={5}
                    error={errors.featured_image?.[0] || errors.featured_image_url?.[0]}
                  />
                  {(errors.featured_image || errors.featured_image_url) && (errors.featured_image?.[0] || errors.featured_image_url?.[0]) && (
                    <p className="text-sm text-red-500 mt-1">{errors.featured_image?.[0] || errors.featured_image_url?.[0]}</p>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Sponsor Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sponsor_name">Sponsor Name *</Label>
                      <Input
                        id="sponsor_name"
                        value={formData.sponsor_name}
                        onChange={(e) => {
                          setFormData({ ...formData, sponsor_name: e.target.value });
                          if (errors.sponsor_name) setErrors({ ...errors, sponsor_name: [] });
                        }}
                        placeholder="Company or individual name"
                        className={`mt-1 border-slate-300 ${errors.sponsor_name ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.sponsor_name && errors.sponsor_name.length > 0 && (
                        <p className="text-sm text-red-500 mt-1">{errors.sponsor_name[0]}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Sponsor Logo (optional)</Label>
                        <FileUpload
                          value={formData.sponsor_logo_url}
                          onChange={(file, url) => {
                            setSponsorLogoFile(file);
                            setFormData({ ...formData, sponsor_logo_url: url || '' });
                            if (errors.sponsor_logo || errors.sponsor_logo_url) {
                              const newErrors = { ...errors };
                              delete newErrors.sponsor_logo;
                              delete newErrors.sponsor_logo_url;
                              setErrors(newErrors);
                            }
                          }}
                          onUrlChange={(url) => {
                            setFormData({ ...formData, sponsor_logo_url: url });
                            setSponsorLogoFile(null);
                            if (errors.sponsor_logo_url) setErrors({ ...errors, sponsor_logo_url: [] });
                          }}
                          label=""
                          showUrlInput={true}
                          accept="image/*"
                          maxSize={5}
                          error={errors.sponsor_logo?.[0] || errors.sponsor_logo_url?.[0]}
                        />
                        {(errors.sponsor_logo || errors.sponsor_logo_url) && (errors.sponsor_logo?.[0] || errors.sponsor_logo_url?.[0]) && (
                          <p className="text-sm text-red-500 mt-1">{errors.sponsor_logo?.[0] || errors.sponsor_logo_url?.[0]}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="sponsor_website">Sponsor Website (optional)</Label>
                        <Input
                          id="sponsor_website"
                          type="url"
                          value={formData.sponsor_website}
                          onChange={(e) => {
                            setFormData({ ...formData, sponsor_website: e.target.value });
                            if (errors.sponsor_website) setErrors({ ...errors, sponsor_website: [] });
                          }}
                          placeholder="https://example.com"
                          className={`mt-1 border-slate-300 ${errors.sponsor_website ? 'border-red-500' : ''}`}
                        />
                        {errors.sponsor_website && errors.sponsor_website.length > 0 && (
                          <p className="text-sm text-red-500 mt-1">{errors.sponsor_website[0]}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sponsor_description">Sponsor Description (optional)</Label>
                      <Textarea
                        id="sponsor_description"
                        value={formData.sponsor_description}
                        onChange={(e) => {
                          setFormData({ ...formData, sponsor_description: e.target.value });
                          if (errors.sponsor_description) setErrors({ ...errors, sponsor_description: [] });
                        }}
                        placeholder="Brief description about the sponsor"
                        rows={3}
                        className={`mt-1 border-slate-300 ${errors.sponsor_description ? 'border-red-500' : ''}`}
                      />
                      {errors.sponsor_description && errors.sponsor_description.length > 0 && (
                        <p className="text-sm text-red-500 mt-1">{errors.sponsor_description[0]}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => {
                        setFormData({ ...formData, status: value as any });
                        if (errors.status) setErrors({ ...errors, status: [] });
                      }}
                    >
                      <SelectTrigger className={`mt-1 border-slate-300 ${errors.status ? 'border-red-500' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && errors.status.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.status[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority (0-100)</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => {
                        setFormData({ ...formData, priority: parseInt(e.target.value) || 0 });
                        if (errors.priority) setErrors({ ...errors, priority: [] });
                      }}
                      className={`mt-1 border-slate-300 ${errors.priority ? 'border-red-500' : ''}`}
                      min="0"
                      max="100"
                    />
                    {errors.priority && errors.priority.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.priority[0]}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="published_at">Published Date (optional)</Label>
                    <Input
                      id="published_at"
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={(e) => {
                        setFormData({ ...formData, published_at: e.target.value });
                        if (errors.published_at) setErrors({ ...errors, published_at: [] });
                      }}
                      className={`mt-1 border-slate-300 ${errors.published_at ? 'border-red-500' : ''}`}
                    />
                    {errors.published_at && errors.published_at.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.published_at[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="expires_at">Expires Date (optional)</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => {
                        setFormData({ ...formData, expires_at: e.target.value });
                        if (errors.expires_at) setErrors({ ...errors, expires_at: [] });
                      }}
                      className={`mt-1 border-slate-300 ${errors.expires_at ? 'border-red-500' : ''}`}
                    />
                    {errors.expires_at && errors.expires_at.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.expires_at[0]}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meta_title">SEO Meta Title (optional)</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => {
                        setFormData({ ...formData, meta_title: e.target.value });
                        if (errors.meta_title) setErrors({ ...errors, meta_title: [] });
                      }}
                      className={`mt-1 border-slate-300 ${errors.meta_title ? 'border-red-500' : ''}`}
                    />
                    {errors.meta_title && errors.meta_title.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.meta_title[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="meta_description">SEO Meta Description (optional)</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => {
                        setFormData({ ...formData, meta_description: e.target.value });
                        if (errors.meta_description) setErrors({ ...errors, meta_description: [] });
                      }}
                      rows={2}
                      className={`mt-1 border-slate-300 ${errors.meta_description ? 'border-red-500' : ''}`}
                    />
                    {errors.meta_description && errors.meta_description.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.meta_description[0]}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/sponsorship-posts')}
                    className="border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-primary hover:bg-accent transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Creating...' : 'Create Sponsorship Post'}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

