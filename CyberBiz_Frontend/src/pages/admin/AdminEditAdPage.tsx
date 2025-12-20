import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { AdSlot } from '@/types';

const adSchema = z.object({
  position: z.enum(['HOME_HEADER', 'SIDEBAR', 'JOB_DETAIL']),
  image_url: z.string().url('Must be a valid URL'),
  target_url: z.string().url('Must be a valid URL'),
  is_active: z.boolean(),
});

type AdFormData = z.infer<typeof adSchema>;

export default function AdminEditAdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ad, setAd] = useState<AdSlot | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
  });

  const position = watch('position');
  const isActive = watch('is_active');

  useEffect(() => {
    if (id) {
      loadAd();
    }
  }, [id]);

  const loadAd = async () => {
    try {
      const response = await apiService.getAd(Number(id!));
      const adData = response.data;
      setAd(adData);
      setValue('position', adData.position);
      setValue('image_url', adData.image_url);
      setValue('target_url', adData.target_url);
      setValue('is_active', adData.is_active);
    } catch (error) {
      toast.error('Ad not found');
      navigate('/admin/ads');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AdFormData) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await apiService.updateAd(Number(id), {
        position: data.position,
        image_url: data.image_url,
        target_url: data.target_url,
        is_active: data.is_active,
      });
      toast.success('Ad updated successfully!');
      navigate('/admin/ads');
    } catch (error) {
      toast.error('Failed to update ad');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
          <button onClick={() => navigate('/admin/ads')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back to Ads
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Edit Ad Slot</h1>
            <p className="text-muted-foreground mb-8">Update ad slot details</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select value={position} onValueChange={(value) => setValue('position', value as AdFormData['position'])}>
                    <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOME_HEADER">Home Header</SelectItem>
                      <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                      <SelectItem value="JOB_DETAIL">Job Detail</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL *</Label>
                  <Input id="image_url" type="url" placeholder="https://example.com/ad-image.jpg" {...register('image_url')} />
                  {errors.image_url && <p className="text-sm text-destructive">{errors.image_url.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_url">Target URL *</Label>
                  <Input id="target_url" type="url" placeholder="https://example.com" {...register('target_url')} />
                  {errors.target_url && <p className="text-sm text-destructive">{errors.target_url.message}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch id="is_active" checked={isActive} onCheckedChange={(checked) => setValue('is_active', checked)} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/ads')}>Cancel</Button>
                <Button type="submit" className="bg-gold-gradient hover:opacity-90" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

