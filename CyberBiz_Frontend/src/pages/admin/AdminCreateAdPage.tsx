import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Header, Footer } from '@/components/layout';
import { FileUpload } from '@/components/ui/file-upload';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

const adSchema = z.object({
  position: z.enum(['HOME_HEADER', 'SIDEBAR', 'JOB_DETAIL']).optional(),
  target_url: z.string().url('Must be a valid URL'),
  is_active: z.boolean(),
});

type AdFormData = z.infer<typeof adSchema>;

export default function AdminCreateAdPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: { position: undefined, is_active: true },
  });

  const position = watch('position');
  const isActive = watch('is_active');

  const onSubmit = async (data: AdFormData) => {
    if (!data.position) {
      toast.error('Please select a position');
      return;
    }
    
    if (!imageFile && !imageUrl) {
      toast.error('Please provide an image (upload file or enter URL)');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.createAd({
        position: data.position,
        image: imageFile || undefined,
        image_url: imageUrl || undefined,
        target_url: data.target_url,
        is_active: data.is_active,
      });
      toast.success('Ad created successfully!');
      navigate('/admin/ads');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create ad');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
          <button onClick={() => navigate('/admin/ads')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back to Ads
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Ad Slot</h1>
            <p className="text-muted-foreground mb-8">Fill in the details below to create a new ad slot</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select value={position || ''} onValueChange={(value) => setValue('position', value as AdFormData['position'])}>
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
                  <Label>Ad Image *</Label>
                  <FileUpload
                    value={imageUrl}
                    onChange={(file, url) => {
                      setImageFile(file);
                      setImageUrl(url || '');
                    }}
                    onUrlChange={(url) => setImageUrl(url)}
                    label="Ad Image"
                    showUrlInput={true}
                    accept="image/*"
                    maxSize={5}
                  />
                  {!imageFile && !imageUrl && (
                    <p className="text-sm text-destructive">Please upload an image or provide an image URL</p>
                  )}
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
                <Button type="submit" className="bg-primary hover:opacity-90" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Ad'}
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

