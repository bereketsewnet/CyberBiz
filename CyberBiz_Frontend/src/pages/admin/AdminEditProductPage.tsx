import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { Product } from '@/types';

const productSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  type: z.enum(['COURSE', 'EBOOK']),
  price_etb: z.number().min(0, 'Price must be positive'),
  thumbnail_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  content_path: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

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
      setValue('description', productData.description);
      setValue('type', productData.type);
      setValue('price_etb', productData.price_etb);
      setValue('thumbnail_url', productData.thumbnail_url || '');
      setValue('content_path', productData.content_path || '');
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
      await apiService.updateAdminProduct(id, {
        title: data.title,
        description: data.description,
        type: data.type,
        price_etb: data.price_etb,
        thumbnail_url: data.thumbnail_url || undefined,
        content_path: data.content_path || undefined,
      });
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
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" placeholder="Describe the product..." rows={8} {...register('description')} />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
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
                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
                  <Input id="thumbnail_url" type="url" placeholder="https://example.com/image.jpg" {...register('thumbnail_url')} />
                  {errors.thumbnail_url && <p className="text-sm text-destructive">{errors.thumbnail_url.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content_path">Content Path (Optional)</Label>
                  <Input id="content_path" placeholder="/path/to/content" {...register('content_path')} />
                </div>
              </div>
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

