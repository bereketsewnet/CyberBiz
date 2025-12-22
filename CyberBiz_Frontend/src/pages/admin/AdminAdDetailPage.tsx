import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { AdSlot } from '@/types';

export default function AdminAdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<AdSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAd();
    }
  }, [id]);

  const loadAd = async () => {
    try {
      const response = await apiService.getAd(Number(id!));
      setAd(response.data);
    } catch (error) {
      toast.error('Ad not found');
      navigate('/admin/ads');
    } finally {
      setIsLoading(false);
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

  if (!ad) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
          <button onClick={() => navigate('/admin/ads')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back to Ads
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">Ad Details</h1>
                <p className="text-muted-foreground">View ad slot information</p>
              </div>
              <Button onClick={() => navigate(`/admin/ads/${id}/edit`)} className="bg-primary">
                <Edit className="w-4 h-4 mr-2" />Edit Ad
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={`Ad ${ad.position}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute top-4 right-4" variant={ad.is_active ? 'default' : 'secondary'}>
                  {ad.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground text-sm">Position:</span>
                  <p className="font-semibold text-foreground">{ad.position.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Target URL:</span>
                  <p className="font-semibold text-foreground break-all">
                    <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {ad.target_url}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Image URL:</span>
                  <p className="font-semibold text-foreground break-all">{ad.image_url}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Impressions:</span>
                  <p className="font-semibold text-foreground">{ad.impressions.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Created:</span>
                  <p className="font-semibold text-foreground">{new Date(ad.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Last Updated:</span>
                  <p className="font-semibold text-foreground">{new Date(ad.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

