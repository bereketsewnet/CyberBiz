import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, FileText, ShoppingCart, Upload, CheckCircle, AlertCircle, Share2, Facebook, Twitter, Send, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Header, Footer } from '@/components/layout';
import { ProductResources } from '@/components/products/ProductResources';
import { getImageUrl } from '@/lib/imageUtils';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const response = await apiService.getProduct(id);
        setProduct(response.data);
        
        // Check if user has access (is in library)
        if (isAuthenticated && user) {
          try {
            const libraryResponse = await apiService.getUserLibrary();
            const hasProductAccess = libraryResponse.data.some((p) => p.id === id);
            setHasAccess(hasProductAccess);
          } catch (error) {
            // If user doesn't have library access, they don't have access
            setHasAccess(false);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
        navigate('/courses');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate, isAuthenticated, user]);

  const handlePurchaseClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to purchase');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    // Allow any authenticated user to purchase products (except admin)
    // Admin has different access, but regular users (SEEKER, EMPLOYER, LEARNER) can all buy courses
    if (user?.role === 'ADMIN') {
      // Admins typically don't purchase products, but if needed they can
      // For now, just allow it - admin can do everything
    }
    // All other roles (SEEKER, EMPLOYER, LEARNER) can purchase products

    // If product is free, claim it directly
    if (product?.is_free) {
      setIsProcessing(true);
      try {
        await apiService.claimFreeProduct(product.id);
        toast.success('Product added to your library!');
        // Refresh product to update access status
        const response = await apiService.getProduct(product.id);
        setProduct(response.data);
        setHasAccess(true);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to claim product');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setShowPurchaseModal(true);
    initiatePayment();
  };

  const initiatePayment = async () => {
    if (!product) return;
    setIsProcessing(true);
    try {
      const response = await apiService.initiatePayment(product.id, product.price_etb);
      setTransaction(response.data);
      toast.success('Payment initiated. Please upload proof of payment.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
      setShowPurchaseModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadProof = async () => {
    if (!paymentProof || !transaction) {
      toast.error('Please select a payment proof file');
      return;
    }

    setIsProcessing(true);
    try {
      await apiService.uploadPaymentProof(transaction.id, paymentProof);
      toast.success('Payment proof uploaded! It will be reviewed by admin.');
      setShowPurchaseModal(false);
      setPaymentProof(null);
      setTransaction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload proof');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const ProductIcon = product?.type === 'COURSE' ? BookOpen : FileText;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleNativeShare = async () => {
    if (!product || !navigator.share) return;
    const shareData = {
      title: product.title,
      text: product.description || product.title,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      
      <main className="flex-1">
        <section className="border-b" style={{ backgroundColor: '#0F172A', borderColor: 'rgb(30 41 59)', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-10"
            >
              {/* Product Image */}
              <div className="aspect-video bg-muted rounded-xl overflow-hidden">
                {product.thumbnail_url ? (
                  <img
                    src={getImageUrl(product.thumbnail_url)}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ProductIcon className="w-24 h-24 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={product.type === 'COURSE' ? 'default' : 'secondary'}>
                      {product.type}
                    </Badge>
                    {product.is_free && (
                      <Badge variant="default" style={{ backgroundColor: '#10b981' }}>
                        Free
                      </Badge>
                    )}
                  </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {product.title}
                    </h1>
                    <div className="text-4xl font-bold mb-6" style={{ color: '#F97316', fontFamily: 'Inter, sans-serif' }}>
                      {product.is_free ? 'Free' : formatPrice(product.price_etb)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShareOpen(true)}
                    className="mt-1 border-slate-500 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Description</h3>
                    {product.description_html ? (
                      <div
                        className="text-slate-300 leading-relaxed prose prose-slate max-w-none prose-invert"
                        dangerouslySetInnerHTML={{ __html: product.description_html }}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    ) : (
                      <p className="text-slate-300 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{product.description}</p>
                    )}
                  </div>
                </div>

                {hasAccess ? (
                  <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-400" style={{ fontFamily: 'Inter, sans-serif' }}>You have access to this product</p>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-accent transition-colors"
                    onClick={handlePurchaseClick}
                    disabled={isProcessing}
                  >
                    {product.is_free ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {isProcessing ? 'Adding to Library...' : 'Get Free'}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {isProcessing ? 'Processing...' : 'Purchase Now'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Resources Section - Only show if user has access */}
        {hasAccess && id && (
          <section className="py-10 border-t bg-white" style={{ borderColor: 'rgb(226 232 240)', fontFamily: 'Inter, sans-serif' }}>
            <div className="container mx-auto px-4 lg:px-8">
              <ProductResources productId={id} isDownloadable={product.is_downloadable || false} />
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase {product.title}</DialogTitle>
            <DialogDescription>
              Complete your purchase by uploading proof of payment
            </DialogDescription>
          </DialogHeader>

          {transaction && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium text-foreground">Payment Instructions:</p>
                <p className="text-muted-foreground">
                  Please transfer {formatPrice(product.price_etb)} to our account and upload the payment proof.
                </p>
                <p className="text-muted-foreground">
                  Transaction ID: <span className="font-mono">{transaction.id}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Payment Proof (Image or PDF) *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    {paymentProof ? (
                      <p className="text-sm font-medium">{paymentProof.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowPurchaseModal(false)} className="border-slate-300">
              Cancel
            </Button>
            <Button
              onClick={handleUploadProof}
              disabled={!paymentProof || !transaction || isProcessing}
              className="bg-primary hover:bg-accent transition-colors"
            >
              {isProcessing ? 'Uploading...' : 'Upload Proof'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this {product?.type === 'COURSE' ? 'course' : 'product'}</DialogTitle>
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
                      product?.title || ''
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
                      product?.title || ''
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
                    `https://wa.me/?text=${encodeURIComponent((product?.title || '') + ' ' + currentUrl)}`
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

