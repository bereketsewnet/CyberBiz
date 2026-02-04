import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, FileText, Share2, Facebook, Twitter, Send, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header, Footer } from '@/components/layout';
import { CommentsSection } from '@/components/blog/CommentsSection';
import { NativeAdDisplay } from '@/components/ads/NativeAdDisplay';
import { apiService } from '@/services/apiService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { Blog } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // If user is admin, use admin endpoint (can view drafts)
        // Otherwise, use public endpoint (only published blogs)
        const response = user?.role === 'ADMIN' 
          ? await apiService.getAdminBlog(id)
          : await apiService.getBlog(id);
        setBlog(response.data);
      } catch (error: any) {
        console.error('Error fetching blog:', error);
        // If public endpoint fails and user is admin, try admin endpoint as fallback
        if (user?.role === 'ADMIN') {
          try {
            const fallbackResponse = await apiService.getAdminBlog(id);
            setBlog(fallbackResponse.data);
          } catch (fallbackError) {
            toast.error(error.message || 'Failed to load blog post');
          }
        } else {
          toast.error(error.message || 'Failed to load blog post');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [id, user]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleNativeShare = async () => {
    if (!blog || !navigator.share) return;
    const shareData = {
      title: blog.title,
      text: blog.excerpt || blog.title,
      url: currentUrl,
    };
    if (navigator.canShare && !navigator.canShare(shareData)) {
      toast.error('Sharing is not supported on this device');
      return;
    }
    try {
      setIsSharing(true);
      await navigator.share(shareData);
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Unable to share right now');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  const openShareWindow = (url: string) => {
    const w = 600;
    const h = 600;
    const left = window.screenX + (window.innerWidth - w) / 2;
    const top = window.screenY + (window.innerHeight - h) / 2;
    window.open(url, '_blank', `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`);
  };

  const handleShareClick = () => {
    setShareOpen(true);
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
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Header />
        <main className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Blog post not found</h2>
            <p className="text-slate-600 mb-4">The blog post you're looking for doesn't exist.</p>
            <Button asChild className="bg-primary hover:bg-accent">
              <Link to="/blogs">Back to Blog</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        {/* Header Section */}
        <section className="border-b" style={{ backgroundColor: '#0F172A', borderColor: 'rgb(30 41 59)', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/blogs')}
              className="mb-6 text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {blog.category && (
                <Link
                  to={`/blogs?category=${blog.category.id}`}
                  className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full mb-4 hover:bg-primary/30 transition-colors"
                >
                  {blog.category.name}
                </Link>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                {blog.title}
              </h1>
              {blog.excerpt && (
                <p className="text-xl text-slate-300 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {blog.excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-6 text-slate-400">
                {blog.author && (
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {blog.author.full_name}
                  </span>
                )}
                {blog.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {new Date(blog.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareClick}
                  className="text-slate-400 hover:text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Image */}
        {blog.featured_image_url && (
          <section className="border-b border-slate-200">
            <div className="container mx-auto px-4 lg:px-8 py-8">
              <img
                src={blog.featured_image_url}
                alt={blog.title}
                className="w-full max-w-4xl mx-auto rounded-xl"
              />
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>
        </section>

        {/* Native Ad - After Content */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <NativeAdDisplay position="after_content" />
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <CommentsSection blogId={id!} />

        {/* Back to Blog */}
        <section className="border-t border-slate-200 py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Button
                variant="outline"
                onClick={() => navigate('/blogs')}
                className="border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Posts
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Share dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {navigator.share && (
              <Button
                type="button"
                className="w-full bg-primary hover:bg-accent justify-center"
                onClick={handleNativeShare}
                disabled={isSharing}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isSharing ? 'Sharing…' : 'Share via device'}
              </Button>
            )}

            <div className="grid grid-cols-3 gap-3 text-sm">
              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  openShareWindow(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
                  )
                }
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Facebook className="w-4 h-4 text-blue-600" />
                </div>
                <span>Facebook</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  openShareWindow(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(
                      blog?.title || ''
                    )}`
                  )
                }
              >
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-sky-500" />
                </div>
                <span>Twitter</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  openShareWindow(
                    `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(
                      blog?.title || ''
                    )}`
                  )
                }
              >
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
                  <Send className="w-4 h-4 text-sky-600" />
                </div>
                <span>Telegram</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  openShareWindow(
                    `https://wa.me/?text=${encodeURIComponent((blog?.title || '') + ' ' + currentUrl)}`
                  )
                }
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  openShareWindow(
                    `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                      currentUrl
                    )}&title=${encodeURIComponent(blog?.title || '')}`
                  )
                }
              >
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-sky-700" />
                </div>
                <span>LinkedIn</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={handleCopyLink}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-slate-700" />
                </div>
                <span>Copy link</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

