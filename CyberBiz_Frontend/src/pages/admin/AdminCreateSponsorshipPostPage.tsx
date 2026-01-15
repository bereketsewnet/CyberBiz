import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.sponsor_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await apiService.createSponsorshipPost({
        ...formData,
        published_at: formData.published_at || undefined,
        expires_at: formData.expires_at || undefined,
        priority: formData.priority || 0,
      });
      toast.success('Sponsorship post created successfully!');
      navigate('/admin/sponsorship-posts');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create sponsorship post');
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Post title"
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
                    placeholder="post-slug"
                    className="mt-1 border-slate-300"
                  />
                  <p className="text-sm text-slate-500 mt-1">Leave empty to auto-generate from title</p>
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Post content (HTML supported)"
                    rows={15}
                    className="mt-1 border-slate-300 font-mono text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt (optional)</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief excerpt/summary"
                    rows={3}
                    className="mt-1 border-slate-300"
                  />
                </div>

                <div>
                  <Label htmlFor="featured_image_url">Featured Image URL (optional)</Label>
                  <Input
                    id="featured_image_url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 border-slate-300"
                  />
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Sponsor Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sponsor_name">Sponsor Name *</Label>
                      <Input
                        id="sponsor_name"
                        value={formData.sponsor_name}
                        onChange={(e) => setFormData({ ...formData, sponsor_name: e.target.value })}
                        placeholder="Company or individual name"
                        className="mt-1 border-slate-300"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sponsor_logo_url">Sponsor Logo URL (optional)</Label>
                        <Input
                          id="sponsor_logo_url"
                          value={formData.sponsor_logo_url}
                          onChange={(e) => setFormData({ ...formData, sponsor_logo_url: e.target.value })}
                          placeholder="https://example.com/logo.png"
                          className="mt-1 border-slate-300"
                        />
                      </div>

                      <div>
                        <Label htmlFor="sponsor_website">Sponsor Website (optional)</Label>
                        <Input
                          id="sponsor_website"
                          type="url"
                          value={formData.sponsor_website}
                          onChange={(e) => setFormData({ ...formData, sponsor_website: e.target.value })}
                          placeholder="https://example.com"
                          className="mt-1 border-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sponsor_description">Sponsor Description (optional)</Label>
                      <Textarea
                        id="sponsor_description"
                        value={formData.sponsor_description}
                        onChange={(e) => setFormData({ ...formData, sponsor_description: e.target.value })}
                        placeholder="Brief description about the sponsor"
                        rows={3}
                        className="mt-1 border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger className="mt-1 border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority (0-100)</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      className="mt-1 border-slate-300"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="published_at">Published Date (optional)</Label>
                    <Input
                      id="published_at"
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                      className="mt-1 border-slate-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expires_at">Expires Date (optional)</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      className="mt-1 border-slate-300"
                    />
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

