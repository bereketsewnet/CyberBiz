import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

export default function AdminCreateNativeAdPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    position: 'content_inline' as 'content_inline' | 'sidebar' | 'footer' | 'between_posts' | 'after_content',
    type: 'advertisement' as 'sponsored' | 'advertisement' | 'promoted',
    advertiser_name: '',
    is_active: true,
    start_date: '',
    end_date: '',
    priority: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic client-side validation for required fields
    const newErrors: Record<string, string[]> = {};
    if (!formData.title.trim()) {
      newErrors.title = ['Title is required'];
    }
    if (!formData.link_url.trim()) {
      newErrors.link_url = ['Link URL is required'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const submitData: any = {
        title: formData.title.trim(),
        link_url: formData.link_url.trim(),
        position: formData.position,
        type: formData.type,
        is_active: formData.is_active,
      };

      // Only include optional fields if they have values
      if (formData.description.trim()) submitData.description = formData.description.trim();
      if (imageFile) submitData.image = imageFile;
      if (formData.image_url.trim()) submitData.image_url = formData.image_url.trim();
      if (formData.advertiser_name.trim()) submitData.advertiser_name = formData.advertiser_name.trim();
      if (formData.start_date) submitData.start_date = formData.start_date;
      if (formData.end_date) submitData.end_date = formData.end_date;
      if (formData.priority !== undefined && formData.priority !== 0) submitData.priority = formData.priority;

      await apiService.createNativeAd(submitData);
      toast.success('Native ad created successfully!');
      navigate('/admin/native-ads');
    } catch (error: any) {
      // Handle validation errors from backend
      // The API client attaches errors directly to the error object
      if (error.errors) {
        // Convert Laravel validation errors format to our format
        // Laravel returns: { field: ["message1", "message2"] }
        const formattedErrors: Record<string, string[]> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            formattedErrors[field] = messages;
          } else if (typeof messages === 'string') {
            formattedErrors[field] = [messages];
          } else if (typeof messages === 'object' && messages !== null) {
            // Handle nested validation errors
            formattedErrors[field] = [String(messages)];
          }
        });
        
        setErrors(formattedErrors);
        
        // Show a toast with all validation errors
        const errorMessages: string[] = [];
        Object.entries(formattedErrors).forEach(([field, messages]) => {
          messages.forEach((msg: string) => {
            errorMessages.push(`${field}: ${msg}`);
          });
        });
        
        if (errorMessages.length > 0) {
          toast.error(errorMessages.slice(0, 3).join(', ') + (errorMessages.length > 3 ? '...' : ''));
        } else {
          toast.error('Validation failed. Please check the form.');
        }
      } else {
      toast.error(error.message || 'Failed to create native ad');
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
              onClick={() => navigate('/admin/native-ads')}
              className="mb-6 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Native Ads
            </Button>

            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Create Native Ad
            </h1>
            <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Create a new native advertising campaign
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
                    placeholder="Ad title"
                    className={`mt-1 border-slate-300 ${errors.title ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.title && errors.title.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{errors.title[0]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (errors.description) setErrors({ ...errors, description: [] });
                    }}
                    placeholder="Ad description"
                    rows={3}
                    className={`mt-1 border-slate-300 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && errors.description.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{errors.description[0]}</p>
                  )}
                </div>

                  <div>
                  <Label>Image (optional)</Label>
                  <FileUpload
                      value={formData.image_url}
                    onChange={(file, url) => {
                      setImageFile(file);
                      setFormData({ ...formData, image_url: url || '' });
                      if (errors.image || errors.image_url) {
                        const newErrors = { ...errors };
                        delete newErrors.image;
                        delete newErrors.image_url;
                        setErrors(newErrors);
                      }
                    }}
                    onUrlChange={(url) => {
                      setFormData({ ...formData, image_url: url });
                      setImageFile(null);
                      if (errors.image_url) setErrors({ ...errors, image_url: [] });
                    }}
                    label=""
                    showUrlInput={true}
                    accept="image/*"
                    maxSize={5}
                    error={errors.image?.[0] || errors.image_url?.[0]}
                  />
                  {(errors.image || errors.image_url) && (errors.image?.[0] || errors.image_url?.[0]) && (
                    <p className="text-sm text-red-500 mt-1">{errors.image?.[0] || errors.image_url?.[0]}</p>
                  )}
                  </div>

                  <div>
                    <Label htmlFor="link_url">Link URL *</Label>
                    <Input
                      id="link_url"
                      type="url"
                      value={formData.link_url}
                    onChange={(e) => {
                      setFormData({ ...formData, link_url: e.target.value });
                      if (errors.link_url) setErrors({ ...errors, link_url: [] });
                    }}
                      placeholder="https://example.com"
                    className={`mt-1 border-slate-300 ${errors.link_url ? 'border-red-500' : ''}`}
                      required
                    />
                  {errors.link_url && errors.link_url.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{errors.link_url[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => {
                        setFormData({ ...formData, position: value as any });
                        if (errors.position) setErrors({ ...errors, position: [] });
                      }}
                    >
                      <SelectTrigger className={`mt-1 border-slate-300 ${errors.position ? 'border-red-500' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content_inline">Content Inline</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                        <SelectItem value="between_posts">Between Posts</SelectItem>
                        <SelectItem value="after_content">After Content</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.position && errors.position.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.position[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => {
                        setFormData({ ...formData, type: value as any });
                        if (errors.type) setErrors({ ...errors, type: [] });
                      }}
                    >
                      <SelectTrigger className={`mt-1 border-slate-300 ${errors.type ? 'border-red-500' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sponsored">Sponsored</SelectItem>
                        <SelectItem value="advertisement">Advertisement</SelectItem>
                        <SelectItem value="promoted">Promoted</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && errors.type.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.type[0]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="advertiser_name">Advertiser Name (optional)</Label>
                  <Input
                    id="advertiser_name"
                    value={formData.advertiser_name}
                    onChange={(e) => {
                      setFormData({ ...formData, advertiser_name: e.target.value });
                      if (errors.advertiser_name) setErrors({ ...errors, advertiser_name: [] });
                    }}
                    placeholder="Advertiser/Sponsor name"
                    className={`mt-1 border-slate-300 ${errors.advertiser_name ? 'border-red-500' : ''}`}
                  />
                  {errors.advertiser_name && errors.advertiser_name.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">{errors.advertiser_name[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date (optional)</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => {
                        setFormData({ ...formData, start_date: e.target.value });
                        if (errors.start_date) setErrors({ ...errors, start_date: [] });
                      }}
                      className={`mt-1 border-slate-300 ${errors.start_date ? 'border-red-500' : ''}`}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty to show immediately, or set a future date to schedule
                    </p>
                    {formData.start_date && new Date(formData.start_date) > new Date() && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Ad won't display until this date (currently scheduled for future)
                      </p>
                    )}
                    {errors.start_date && errors.start_date.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.start_date[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date (optional)</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => {
                        setFormData({ ...formData, end_date: e.target.value });
                        if (errors.end_date) setErrors({ ...errors, end_date: [] });
                      }}
                      className={`mt-1 border-slate-300 ${errors.end_date ? 'border-red-500' : ''}`}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty to show indefinitely, or set when ad should stop displaying
                    </p>
                    {formData.end_date && formData.start_date && new Date(formData.end_date) < new Date(formData.start_date) && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ End date must be after start date
                      </p>
                    )}
                    {formData.end_date && new Date(formData.end_date) < new Date() && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ End date is in the past - ad won't display
                      </p>
                    )}
                    {errors.end_date && errors.end_date.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.end_date[0]}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <p className="text-sm text-slate-500 mt-1">Higher priority ads are shown first</p>
                    {errors.priority && errors.priority.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{errors.priority[0]}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/native-ads')}
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
                    {isSaving ? 'Creating...' : 'Create Native Ad'}
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

