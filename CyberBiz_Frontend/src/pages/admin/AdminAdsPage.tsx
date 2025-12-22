import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { AdSlot } from '@/types';

export default function AdminAdsPage() {
  const navigate = useNavigate();
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAds();
  }, [currentPage]);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAdminAds({ page: currentPage });
      setAds(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (adId: number) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
      await apiService.deleteAd(adId);
      toast.success('Ad deleted successfully');
      fetchAds();
    } catch (error) {
      toast.error('Failed to delete ad');
    }
  };

  const filteredAds = ads.filter(ad =>
    !searchQuery ||
    ad.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.target_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Manage Ads</h1>
              <p className="text-muted-foreground">View, create, edit, and delete ad slots</p>
            </div>
            <Button asChild className="bg-primary hover:opacity-90 ">
              <Link to="/admin/ads/create"><Plus className="w-4 h-4 mr-2" />Create Ad</Link>
            </Button>
          </motion.div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search ads..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No ads found</h3>
              <p className="text-muted-foreground mb-6">{searchQuery ? 'Try a different search term' : 'No ads have been created yet'}</p>
              {!searchQuery && <Button asChild className="bg-primary"><Link to="/admin/ads/create"><Plus className="w-4 h-4 mr-2" />Create First Ad</Link></Button>}
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAds.map((ad, index) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    <div className="aspect-video bg-muted relative">
                      {ad.image_url ? (
                        <img src={ad.image_url} alt={`Ad ${ad.position}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3" variant={ad.is_active ? 'default' : 'secondary'}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-foreground mb-2">{ad.position}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{ad.target_url}</p>
                      <p className="text-xs text-muted-foreground mb-4">Impressions: {ad.impressions}</p>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link to={`/admin/ads/${ad.id}`}><Eye className="w-4 h-4 mr-1" />View</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link to={`/admin/ads/${ad.id}/edit`}><Edit className="w-4 h-4 mr-1" />Edit</Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(ad.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <div className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

