import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Share2, ExternalLink, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { NativeAdDisplay } from '@/components/ads/NativeAdDisplay';
import { apiService } from '@/services/apiService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/imageUtils';
import type { SponsorshipPost } from '@/types';

export default function SponsorshipPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState<SponsorshipPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await apiService.getSponsorshipPost(id);
        setPost(response.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load sponsorship post');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleShare = async () => {
    if (!post) return;

    const url = window.location.href;
    const shareData = {
      title: post.title,
      text: post.excerpt || post.title,
      url: url,
    };

    // Use Web Share API if available (mobile devices)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('Link copied to clipboard!');
        } catch (err) {
          toast.error('Failed to copy link');
        }
        document.body.removeChild(textArea);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Header />
        <main className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading sponsorship post...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Header />
        <main className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sponsorship post not found</h2>
            <p className="text-slate-600 mb-4">The sponsorship post you're looking for doesn't exist.</p>
            <Button asChild className="bg-primary hover:bg-accent">
              <Link to="/">Back to Home</Link>
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
              onClick={() => navigate('/')}
              className="mb-6 text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <Badge className="mb-4 bg-primary/20 text-primary">
                Sponsored Content
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-xl text-slate-300 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {post.excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-6 text-slate-400">
                <div className="flex items-center gap-3">
                  {post.sponsor_logo_url && (
                    <img
                      src={getImageUrl(post.sponsor_logo_url)}
                      alt={post.sponsor_name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span className="font-medium text-slate-300">{post.sponsor_name}</span>
                </div>
                {post.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
                {post.sponsor_website && (
                  <a
                    href={post.sponsor_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Sponsor
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-slate-400 hover:text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {user?.role === 'ADMIN' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/sponsorship-posts/${post.id}/edit`)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Image */}
        {post.featured_image_url && (
          <section className="border-b border-slate-200">
            <div className="container mx-auto px-4 lg:px-8 py-8">
              <div className="max-w-4xl mx-auto">
                <img
                  src={getImageUrl(post.featured_image_url)}
                  alt={post.title}
                  className="w-full rounded-xl shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Sponsor Info */}
        {post.sponsor_description && (
          <section className="border-b border-slate-200 bg-slate-50">
            <div className="container mx-auto px-4 lg:px-8 py-6">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">About {post.sponsor_name}</h3>
                <p className="text-slate-600">{post.sponsor_description}</p>
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
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

        {/* Back to Home */}
        <section className="border-t border-slate-200 py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

