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
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { FileUpload } from '@/components/ui/file-upload';
import { ProductResourcesManager } from '@/components/admin/ProductResourcesManager';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { Product } from '@/types';

const productSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description_html: z.string().min(50, 'Description must be at least 50 characters'),
  type: z.enum(['COURSE', 'EBOOK']),
  price_etb: z.number().min(0, 'Price must be positive'),
  content_path: z.string().optional(),
  is_downloadable: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [thumbnailChanged, setThumbnailChanged] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const type = watch('type');
  const descriptionHtml = watch('description_html');
  const isDownloadable = watch('is_downloadable');

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await apiService.getAdminProduct(id!);
      const productData = response.data;
      setProduct(productData);
      setValue('title', productData.title);
      setValue('description_html', productData.description_html || productData.description || '');
      setValue('type', productData.type);
      setValue('price_etb', productData.price_etb);
      setValue('content_path', productData.content_path || '');
      setValue('is_downloadable', productData.is_downloadable || false);
      setThumbnailUrl(productData.thumbnail_url || '');
    } catch (error) {
      toast.error('Product not found');
      navigate('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const updateData: {
        title: string;
        description_html: string;
        type: 'COURSE' | 'EBOOK';
        price_etb: number;
        thumbnail?: File;
        thumbnail_url?: string;
        content_path?: string;
        is_downloadable?: boolean;
      } = {
        title: data.title,
        description_html: data.description_html,
        type: data.type,
        price_etb: data.price_etb,
      };

      // Only include thumbnail if it has changed
      if (thumbnailChanged) {
        if (thumbnailFile) {
          // New file uploaded
          updateData.thumbnail = thumbnailFile;
        } else if (thumbnailUrl === '') {
          // Thumbnail was removed
          updateData.thumbnail_url = '';
        } else if (thumbnailUrl) {
          // URL provided (either new or updated)
          updateData.thumbnail_url = thumbnailUrl;
        }
      }
      // If thumbnailChanged is false, don't include thumbnail data (keeps existing)

      if (data.content_path !== undefined) {
        updateData.content_path = data.content_path;
      }

      await apiService.updateAdminProduct(id, updateData);
      toast.success('Product updated successfully!');
      navigate('/admin/products');
    } catch (error) {
      toast.error('Failed to update product');
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
          <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back to Products
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Edit Product</h1>
            <p className="text-muted-foreground mb-8">Update product details</p>
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
                </div>
                <FileUpload
                  value={thumbnailUrl}
                  onChange={(file, url) => {
                    setThumbnailFile(file);
                    setThumbnailUrl(url || '');
                    setThumbnailChanged(true);
                  }}
                  onUrlChange={(url) => {
                    setThumbnailUrl(url);
                    setThumbnailChanged(true);
                  }}
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
                    Optional: External URL to access course content. For multiple files/videos, use the Resources section below instead.
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_downloadable">Downloadable</Label>
                    <p className="text-sm text-muted-foreground">Allow users to download course resources</p>
                  </div>
                  <Switch
                    id="is_downloadable"
                    checked={isDownloadable || false}
                    onCheckedChange={(checked) => setValue('is_downloadable', checked)}
                  />
                </div>
              </div>

              {/* Resources Management Section - Only show if product exists */}
              {id && product && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <ProductResourcesManager productId={id} />
                </div>
              )}

              <div className="flex items-center justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
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

