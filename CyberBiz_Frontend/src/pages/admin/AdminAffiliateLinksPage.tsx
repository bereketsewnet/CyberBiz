import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, ExternalLink, TrendingUp, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { AffiliateLink } from '@/types';

export default function AdminAffiliateLinksPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('program_id');
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  useEffect(() => {
    fetchLinks();
  }, [programId]);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const params: any = { per_page: 50 };
      if (programId) {
        params.program_id = parseInt(programId);
      }
      const response = await apiService.getAdminAffiliateLinks(params);
      setLinks(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
      toast.error('Failed to load affiliate links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async (link: AffiliateLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedCode(link.code);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/affiliate/programs')}
              className="mb-6 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Button>

            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Affiliate Links
            </h1>
            <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              {programId ? 'Links for this program' : 'All affiliate links'}
            </p>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-lg p-6 h-32 animate-pulse" />
                ))}
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No affiliate links found</h3>
                <p className="text-slate-600">No users have joined any affiliate programs yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((link) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {link.program?.name || 'Unknown Program'}
                          </h3>
                          {link.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
                          <span>Affiliate: {link.affiliate?.full_name || link.affiliate?.email || 'Unknown'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <MousePointerClick className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              <strong>{link.clicks_count || link.total_clicks || 0}</strong> clicks
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              <strong>{link.conversions_count || link.total_conversions || 0}</strong> conversions
                            </span>
                          </div>
                          {link.total_commission !== undefined && link.total_commission > 0 && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">
                                <strong>{link.total_commission.toFixed(2)}</strong> {link.program?.type === 'percentage' ? '%' : 'ETB'} total commission
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                          <code className="text-xs font-mono">{link.url}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyLink(link)}
                            className="h-6 px-2"
                          >
                            {copiedCode === link.code ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(link.url, '_blank')}
                          className="border-slate-300"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Link
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

