import { useState, useEffect } from 'react';
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
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { FileUpload } from '@/components/ui/file-upload';
import { ProductResourcesManager } from '@/components/admin/ProductResourcesManager';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description_html: z.string().min(1, 'Description is required'),
  type: z.enum(['COURSE', 'EBOOK']),
  price_etb: z.number().min(0, 'Price must be positive').nullable().optional(),
  content_path: z.string().optional(),
  is_downloadable: z.boolean().optional().default(false),
  is_free: z.boolean().optional().default(false),
}).refine((data) => {
  // If product is free, always allow (price will be set to 0)
  if (data.is_free === true) {
    return true;
  }
  // If product is not free, price is required
  if (!data.is_free && (!data.price_etb || data.price_etb <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Price is required when product is not free',
  path: ['price_etb'],
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminCreateProductPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { type: 'COURSE', description_html: '', is_downloadable: false, is_free: false },
  });

  const type = watch('type');
  const descriptionHtml = watch('description_html');
  const isDownloadable = watch('is_downloadable');
  const isFree = watch('is_free');

  // Automatically set price to 0 when free toggle is enabled
  useEffect(() => {
    if (isFree) {
      setValue('price_etb', 0);
    }
  }, [isFree, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      // Ensure price is 0 if product is free
      const finalPrice = data.is_free ? 0 : (data.price_etb || 0);
      
      const response = await apiService.createAdminProduct({
        title: data.title,
        description_html: data.description_html,
        type: data.type,
        price_etb: finalPrice,
        thumbnail: thumbnailFile || undefined,
        thumbnail_url: thumbnailUrl || undefined,
        content_path: data.content_path || undefined,
        is_downloadable: data.is_downloadable || false,
        is_free: data.is_free === true,
      });
      toast.success('Product created successfully! You can now add resources below.');
      // Store the created product ID to show the resources section
      setCreatedProductId(response.data.id);
      // Scroll to resources section
      setTimeout(() => {
        document.getElementById('resources-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
          <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            <ArrowLeft className="w-4 h-4" />Back to Products
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Create Product</h1>
            <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>Fill in the details below to create a new course or ebook</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title *</Label>
                  <Input id="title" placeholder="e.g. Full Stack Web Development" {...register('title')} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_html">Description *</Label>
                  <RichTextEditor
                    value={descriptionHtml || ''}
                    onChange={(value) => setValue('description_html', value)}
                    type="product"
                    error={errors.description_html?.message}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Product Type *</Label>
                    <Select value={type} onValueChange={(value) => setValue('type', value as 'COURSE' | 'EBOOK')}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COURSE">Course</SelectItem>
                        <SelectItem value="EBOOK">E-Book</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!isFree && (
                    <div className="space-y-2">
                      <Label htmlFor="price_etb">Price (ETB) *</Label>
                      <Input
                        id="price_etb"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...register('price_etb', { valueAsNumber: true })}
                      />
                      {errors.price_etb && <p className="text-sm text-destructive">{errors.price_etb.message}</p>}
                    </div>
                  )}
                </div>
                <FileUpload
                  value={thumbnailUrl}
                  onChange={(file, url) => {
                    setThumbnailFile(file);
                    setThumbnailUrl(url || '');
                  }}
                  onUrlChange={(url) => setThumbnailUrl(url)}
                  label="Thumbnail Image (Optional)"
                  showUrlInput={true}
                  accept="image/*"
                  maxSize={5}
                />
                <div className="space-y-2">
                  <Label htmlFor="content_path">
                    External Content URL (Optional)
                    <span className="text-xs text-muted-foreground font-normal ml-2">
                      Legacy field - Leave blank if using Resources section below
                    </span>
                  </Label>
                  <Input
                    id="content_path"
                    placeholder="https://example.com/course-access"
                    {...register('content_path')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: External URL to access course content. For multiple files/videos, use the Resources section instead.
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_downloadable">Downloadable</Label>
                    <p className="text-sm text-muted-foreground">Allow users to download course resources</p>
                  </div>
                  <Switch
                    id="is_downloadable"
                    checked={isDownloadable}
                    onCheckedChange={(checked) => setValue('is_downloadable', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_free">Free Product</Label>
                    <p className="text-sm text-muted-foreground">Make this product free (automatically added to library)</p>
                  </div>
                  <Switch
                    id="is_free"
                    checked={isFree}
                    onCheckedChange={(checked) => setValue('is_free', checked)}
                  />
                </div>
              </div>

              {/* Resources Management Section - Show after product is created */}
              {createdProductId && (
                <div id="resources-section" className="bg-card rounded-xl border border-border p-6">
                  <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      <strong>Recommended File Types:</strong> For the best viewing experience, we recommend using <strong>Video (MP4)</strong> and <strong>PDF</strong> files. These formats provide optimal in-browser viewing without requiring downloads.
                    </p>
                  </div>
                  <ProductResourcesManager productId={createdProductId} />
                </div>
              )}

              <div className="flex items-center justify-end gap-4">
                {createdProductId ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/products')} className="border-slate-300">
                      Back to Products
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate(`/admin/products/${createdProductId}/edit`)} className="border-slate-300">
                      Continue Editing
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/products')} className="border-slate-300">Cancel</Button>
                    <Button type="submit" className="bg-primary hover:bg-accent transition-colors" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Product'}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

