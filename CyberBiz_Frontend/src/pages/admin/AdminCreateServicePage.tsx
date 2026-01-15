import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Header, Footer } from '@/components/layout';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { FileUpload } from '@/components/ui/file-upload';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

export default function AdminCreateServicePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    icon: '',
    image_url: '',
    order: 0,
    is_active: true,
    meta_title: '',
    meta_description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      // If image file is provided, use FormData; otherwise use JSON
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        if (formData.slug.trim()) {
          formDataToSend.append('slug', formData.slug.trim());
        }
        formDataToSend.append('description', formData.description);
        if (formData.content.trim()) {
          formDataToSend.append('content', formData.content.trim());
        }
        if (formData.icon.trim()) {
          formDataToSend.append('icon', formData.icon.trim());
        }
        formDataToSend.append('image', imageFile);
        formDataToSend.append('order', formData.order.toString());
        formDataToSend.append('is_active', formData.is_active ? '1' : '0');
        if (formData.meta_title.trim()) {
          formDataToSend.append('meta_title', formData.meta_title.trim());
        }
        if (formData.meta_description.trim()) {
          formDataToSend.append('meta_description', formData.meta_description.trim());
        }
        await apiService.createService(formDataToSend as any);
      } else {
        const dataToSend: any = {
          title: formData.title,
          description: formData.description,
          order: formData.order,
          is_active: formData.is_active,
        };
        if (formData.slug.trim()) {
          dataToSend.slug = formData.slug.trim();
        }
        if (formData.content.trim()) {
          dataToSend.content = formData.content.trim();
        }
        if (formData.icon.trim()) {
          dataToSend.icon = formData.icon.trim();
        }
        if (formData.image_url.trim()) {
          dataToSend.image_url = formData.image_url.trim();
        }
        if (formData.meta_title.trim()) {
          dataToSend.meta_title = formData.meta_title.trim();
        }
        if (formData.meta_description.trim()) {
          dataToSend.meta_description = formData.meta_description.trim();
        }
        await apiService.createService(dataToSend);
      }
      toast.success('Service created successfully!');
      navigate('/admin/services');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create service');
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
              onClick={() => navigate('/admin/services')}
              className="mb-6 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>

            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Create Service
            </h1>
            <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Add a new service or consulting offering
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Service title"
                    className="mt-1 border-slate-300"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (optional)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="service-slug (auto-generated if empty)"
                    className="mt-1 border-slate-300"
                  />
                  <p className="text-sm text-slate-500 mt-1">Leave empty to auto-generate from title</p>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the service"
                    rows={3}
                    className="mt-1 border-slate-300"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content (optional)</Label>
                  <RichTextEditor
                    value={formData.content || ''}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    type="product"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">Icon Name (optional)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="briefcase, code, palette, etc."
                      className="mt-1 border-slate-300"
                    />
                  </div>

                  <div>
                    <Label>Image (optional)</Label>
                    <FileUpload
                      value={formData.image_url || ''}
                      onChange={(file, url) => {
                        setImageFile(file);
                        setFormData({ ...formData, image_url: url || '' });
                      }}
                      accept="image/*"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="mt-1 border-slate-300"
                      min="0"
                    />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meta_title">SEO Meta Title (optional)</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      className="mt-1 border-slate-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">SEO Meta Description (optional)</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={2}
                      className="mt-1 border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/services')}
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
                    {isSaving ? 'Creating...' : 'Create Service'}
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
