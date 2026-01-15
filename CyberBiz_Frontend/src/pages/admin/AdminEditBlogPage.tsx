import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header, Footer } from '@/components/layout';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { FileUpload } from '@/components/ui/file-upload';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { Blog, BlogCategory } from '@/types';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z.string().max(255).optional(),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  featured_image_url: z.string().optional(),
  category_id: z.number().optional(),
  published_at: z.string().optional(),
  status: z.enum(['draft', 'published']),
  meta_title: z.string().max(255).optional(),
  meta_description: z.string().max(500).optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function AdminEditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string>('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
  });

  const status = watch('status');
  const categoryId = watch('category_id');
  const content = watch('content');

  useEffect(() => {
    if (id) {
      fetchBlog();
      fetchCategories();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await apiService.getAdminBlog(id!);
      const blogData = response.data;
      setBlog(blogData);
      
      // Set form values
      setValue('title', blogData.title);
      setValue('slug', blogData.slug);
      setValue('content', blogData.content);
      setValue('excerpt', blogData.excerpt || '');
      setValue('category_id', blogData.category?.id);
      setValue('status', blogData.status);
      setValue('meta_title', blogData.meta_title || '');
      setValue('meta_description', blogData.meta_description || '');
      setFeaturedImageUrl(blogData.featured_image_url || '');
      setFeaturedImageFile(null);
      
      if (blogData.published_at) {
        const date = new Date(blogData.published_at);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setValue('published_at', localDateTime);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog post');
      navigate('/admin/blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getBlogCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const submitData: any = {
        title: data.title,
        content: data.content,
        status: data.status,
      };
      
      // Only include optional fields if they have values (don't send empty strings)
      if (data.slug && data.slug.trim()) submitData.slug = data.slug.trim();
      if (data.excerpt && data.excerpt.trim()) submitData.excerpt = data.excerpt.trim();
      if (data.category_id) submitData.category_id = data.category_id;
      if (data.published_at) submitData.published_at = data.published_at;
      if (data.meta_title && data.meta_title.trim()) submitData.meta_title = data.meta_title.trim();
      if (data.meta_description && data.meta_description.trim()) submitData.meta_description = data.meta_description.trim();
      if (featuredImageFile) submitData.featured_image = featuredImageFile;
      if (featuredImageUrl && featuredImageUrl.trim()) submitData.featured_image_url = featuredImageUrl.trim();
      
      await apiService.updateBlog(id, submitData);
      toast.success('Blog post updated successfully!');
      navigate('/admin/blogs');
    } catch (error: any) {
      console.error('Error updating blog:', error);
      toast.error(error.message || 'Failed to update blog post');
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
            <p className="text-slate-600">Loading blog post...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
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
              onClick={() => navigate('/admin/blogs')}
              className="mb-6 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </Button>

            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Edit Blog Post</h1>
            <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>Update blog post details</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter blog post title"
                    className="mt-1 border-slate-300"
                  />
                  {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <Label htmlFor="slug">Slug (optional)</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="blog-post-slug"
                    className="mt-1 border-slate-300"
                  />
                  {errors.slug && <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>}
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt (optional)</Label>
                  <Textarea
                    id="excerpt"
                    {...register('excerpt')}
                    placeholder="Brief summary of the blog post (max 500 characters)"
                    rows={3}
                    className="mt-1 border-slate-300"
                  />
                  {errors.excerpt && <p className="text-sm text-red-600 mt-1">{errors.excerpt.message}</p>}
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <RichTextEditor
                    value={content || ''}
                    onChange={(value) => setValue('content', value)}
                    type="product"
                    error={errors.content?.message}
                  />
                </div>

                <div>
                  <Label>Featured Image (optional)</Label>
                  <FileUpload
                    value={featuredImageUrl}
                    onChange={(file, url) => {
                      setFeaturedImageFile(file);
                      setFeaturedImageUrl(url || '');
                    }}
                    onUrlChange={(url) => setFeaturedImageUrl(url)}
                    label="Featured Image"
                    showUrlInput={true}
                    accept="image/*"
                    maxSize={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category_id">Category (optional)</Label>
                    <Select
                      value={categoryId?.toString() || 'none'}
                      onValueChange={(value) => {
                        if (value === 'none') {
                          setValue('category_id', undefined);
                        } else {
                          setValue('category_id', parseInt(value));
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1 border-slate-300">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={status}
                      onValueChange={(value) => setValue('status', value as 'draft' | 'published')}
                    >
                      <SelectTrigger className="mt-1 border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {status === 'published' && (
                  <div>
                    <Label htmlFor="published_at">Publish Date (optional)</Label>
                    <Input
                      id="published_at"
                      type="datetime-local"
                      {...register('published_at')}
                      className="mt-1 border-slate-300"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meta_title">SEO Meta Title (optional)</Label>
                    <Input
                      id="meta_title"
                      {...register('meta_title')}
                      placeholder="SEO title for search engines"
                      className="mt-1 border-slate-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">SEO Meta Description (optional)</Label>
                    <Textarea
                      id="meta_description"
                      {...register('meta_description')}
                      placeholder="SEO description for search engines"
                      rows={2}
                      className="mt-1 border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/blogs')}
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

