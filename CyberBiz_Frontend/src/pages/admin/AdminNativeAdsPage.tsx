import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Search, TrendingUp, BarChart3, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { NativeAd } from '@/types';

export default function AdminNativeAdsPage() {
  const navigate = useNavigate();
  const [ads, setAds] = useState<NativeAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchAds();
  }, [currentPage, positionFilter, typeFilter, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1);
        fetchAds();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAdminNativeAds({
        page: currentPage,
        per_page: 15,
        position: positionFilter !== 'all' ? positionFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active' ? true : false,
        q: searchQuery || undefined,
      });
      setAds(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      toast.error('Failed to load native ads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (adId: number) => {
    if (!confirm('Are you sure you want to delete this native ad?')) return;

    try {
      await apiService.deleteNativeAd(adId.toString());
      toast.success('Native ad deleted successfully');
      fetchAds();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete native ad');
    }
  };

  const handleResetStats = async (adId: number) => {
    if (!confirm('Are you sure you want to reset stats for this ad?')) return;

    try {
      await apiService.resetNativeAdStats(adId.toString());
      toast.success('Stats reset successfully');
      fetchAds();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset stats');
    }
  };

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      content_inline: 'Content Inline',
      sidebar: 'Sidebar',
      footer: 'Footer',
      between_posts: 'Between Posts',
      after_content: 'After Content',
    };
    return labels[position] || position;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sponsored: 'Sponsored',
      advertisement: 'Advertisement',
      promoted: 'Promoted',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Native Ads Management
                </h1>
                <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Manage native advertising campaigns
                </p>
              </div>
              <Button asChild className="bg-primary hover:bg-accent transition-colors">
                <Link to="/admin/native-ads/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Native Ad
                </Link>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search native ads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full md:w-48 border-slate-300">
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="content_inline">Content Inline</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                  <SelectItem value="between_posts">Between Posts</SelectItem>
                  <SelectItem value="after_content">After Content</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48 border-slate-300">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sponsored">Sponsored</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="promoted">Promoted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 border-slate-300">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-lg p-6 h-32 animate-pulse" />
                ))}
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No native ads found</h3>
                <p className="text-slate-600 mb-4">Get started by creating your first native ad</p>
                <Button asChild className="bg-primary hover:bg-accent">
                  <Link to="/admin/native-ads/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Native Ad
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-slate-900">{ad.title}</h3>
                            {ad.is_active ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            {(() => {
                              const now = new Date();
                              const startDate = ad.start_date ? new Date(ad.start_date) : null;
                              const endDate = ad.end_date ? new Date(ad.end_date) : null;
                              const isFuture = startDate && startDate > now;
                              const isExpired = endDate && endDate < now;
                              const isScheduled = isFuture || (startDate && startDate > now);
                              
                              if (!ad.is_active) {
                                return null;
                              }
                              
                              if (isFuture) {
                                return (
                                  <Badge className="bg-orange-100 text-orange-800" title={`Scheduled to start: ${new Date(ad.start_date!).toLocaleString()}`}>
                                    Scheduled
                                  </Badge>
                                );
                              }
                              
                              if (isExpired) {
                                return (
                                  <Badge className="bg-red-100 text-red-800" title={`Ended: ${new Date(ad.end_date!).toLocaleString()}`}>
                                    Expired
                                  </Badge>
                                );
                              }
                              
                              return null;
                            })()}
                            <Badge variant="outline">{getPositionLabel(ad.position)}</Badge>
                            <Badge variant="outline">{getTypeLabel(ad.type)}</Badge>
                          </div>
                          {(() => {
                            const now = new Date();
                            const startDate = ad.start_date ? new Date(ad.start_date) : null;
                            const endDate = ad.end_date ? new Date(ad.end_date) : null;
                            const isFuture = startDate && startDate > now;
                            const isExpired = endDate && endDate < now;
                            
                            if (isFuture && ad.is_active) {
                              return (
                                <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                                  ⚠️ This ad is scheduled and won't display until {new Date(ad.start_date!).toLocaleString()}
                                </div>
                              );
                            }
                            
                            if (isExpired && ad.is_active) {
                              return (
                                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                  ⚠️ This ad has expired and won't display (ended on {new Date(ad.end_date!).toLocaleString()})
                                </div>
                              );
                            }
                            
                            return null;
                          })()}
                          {ad.description && (
                            <p className="text-slate-600 mb-3 line-clamp-2">{ad.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                            <span>Priority: {ad.priority}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {ad.impressions.toLocaleString()} impressions
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4" />
                              {ad.clicks.toLocaleString()} clicks
                            </span>
                            {ad.impressions > 0 && (
                              <span>
                                CTR: {((ad.clicks / ad.impressions) * 100).toFixed(2)}%
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500">
                            <span>Link: </span>
                            <a
                              href={ad.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {ad.link_url}
                            </a>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/native-ads/${ad.id}/edit`)}
                            className="border-slate-300"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetStats(ad.id)}
                            className="border-slate-300"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset Stats
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(ad.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

