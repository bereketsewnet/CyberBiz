import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { NativeAd } from '@/types';

export default function AdminEditNativeAdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<NativeAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    if (id) {
      fetchAd();
    }
  }, [id]);

  const fetchAd = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAdminNativeAd(id!);
      const adData = response.data;
      setAd(adData);
      setFormData({
        title: adData.title,
        description: adData.description || '',
        image_url: adData.image_url || '',
        link_url: adData.link_url,
        position: adData.position,
        type: adData.type,
        advertiser_name: adData.advertiser_name || '',
        is_active: adData.is_active,
        start_date: adData.start_date ? new Date(adData.start_date).toISOString().slice(0, 16) : '',
        end_date: adData.end_date ? new Date(adData.end_date).toISOString().slice(0, 16) : '',
        priority: adData.priority,
      });
    } catch (error) {
      console.error('Error fetching native ad:', error);
      toast.error('Failed to load native ad');
      navigate('/admin/native-ads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.link_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await apiService.updateNativeAd(id!, {
        ...formData,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        priority: formData.priority || 0,
      });
      toast.success('Native ad updated successfully!');
      navigate('/admin/native-ads');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update native ad');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Header />
        <main className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading native ad...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!ad) {
    return null;
  }

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
              Edit Native Ad
            </h1>
            <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Update native ad details
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ad title"
                    className="mt-1 border-slate-300"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ad description"
                    rows={3}
                    className="mt-1 border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image_url">Image URL (optional)</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1 border-slate-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="link_url">Link URL *</Label>
                    <Input
                      id="link_url"
                      type="url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      placeholder="https://example.com"
                      className="mt-1 border-slate-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value as any })}
                    >
                      <SelectTrigger className="mt-1 border-slate-300">
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
                  </div>

                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger className="mt-1 border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sponsored">Sponsored</SelectItem>
                        <SelectItem value="advertisement">Advertisement</SelectItem>
                        <SelectItem value="promoted">Promoted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="advertiser_name">Advertiser Name (optional)</Label>
                  <Input
                    id="advertiser_name"
                    value={formData.advertiser_name}
                    onChange={(e) => setFormData({ ...formData, advertiser_name: e.target.value })}
                    placeholder="Advertiser/Sponsor name"
                    className="mt-1 border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date (optional)</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="mt-1 border-slate-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date (optional)</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="mt-1 border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <p className="text-sm text-slate-500 mt-1">Higher priority ads are shown first</p>
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
                    {isSaving ? 'Saving...' : 'Save Changes'}
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

