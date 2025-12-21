import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, FileText, ShoppingCart, Upload, CheckCircle, AlertCircle } from 'lucide-react';
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

  const handlePurchaseClick = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to purchase');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    // Only LEARNER or SEEKER (JOB_SEEKER) can purchase products
    if (user?.role !== 'LEARNER' && user?.role !== 'SEEKER') {
      toast.error('Only learners and job seekers can purchase products. Please register with a learner or job seeker account.');
      navigate('/signup?role=LEARNER');
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="bg-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
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
                <div>
                  <Badge variant={product.type === 'COURSE' ? 'default' : 'secondary'} className="mb-4">
                    {product.type}
                  </Badge>
                  <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
                    {product.title}
                  </h1>
                  <div className="font-display text-4xl font-bold text-primary mb-6">
                    {formatPrice(product.price_etb)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Description</h3>
                    {product.description_html ? (
                      <div
                        className="text-muted-foreground leading-relaxed prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: product.description_html }}
                      />
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                    )}
                  </div>
                </div>

                {hasAccess ? (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium text-success">You have access to this product</p>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="w-full bg-gold-gradient hover:opacity-90 shadow-gold"
                    onClick={handlePurchaseClick}
                    disabled={isProcessing}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isProcessing ? 'Processing...' : 'Purchase Now'}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Resources Section - Only show if user has access */}
        {hasAccess && id && (
          <section className="py-10 border-t border-border">
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
            <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadProof}
              disabled={!paymentProof || !transaction || isProcessing}
              className="bg-gold-gradient"
            >
              {isProcessing ? 'Uploading...' : 'Upload Proof'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

