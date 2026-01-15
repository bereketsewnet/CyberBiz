import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, TrendingUp, MousePointerClick, DollarSign, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { AffiliateLink } from '@/types';

export default function AffiliateDashboardPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [stats, setStats] = useState({
    total_links: 0,
    total_clicks: 0,
    total_conversions: 0,
    total_commission: 0,
    pending_commission: 0,
    paid_commission: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAffiliateDashboard();
      setLinks(response.data.links);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching affiliate dashboard:', error);
      toast.error('Failed to load affiliate dashboard');
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

  const statCards = [
    {
      label: 'Total Links',
      value: stats.total_links,
      icon: Link2,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Clicks',
      value: stats.total_clicks.toLocaleString(),
      icon: MousePointerClick,
      color: 'bg-green-500',
    },
    {
      label: 'Total Conversions',
      value: stats.total_conversions.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Commission',
      value: `ETB ${stats.total_commission.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Affiliate Dashboard
            </h1>
            <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Track your affiliate performance and earnings
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-slate-200 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Commission Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Commission Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">ETB {stats.pending_commission.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Paid</p>
                  <p className="text-2xl font-bold text-green-600">ETB {stats.paid_commission.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-900">ETB {stats.total_commission.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Affiliate Links */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">My Affiliate Links</h2>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-slate-100 rounded-lg p-6 h-32 animate-pulse" />
                  ))}
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <Link2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No affiliate links yet</h3>
                  <p className="text-slate-600">Join an affiliate program to get started</p>
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
                            <h3 className="text-lg font-semibold text-slate-900">{link.program?.name}</h3>
                            {link.is_active ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-3">
                            Commission: {link.program?.commission_rate}
                            {link.program?.type === 'percentage' ? '%' : ' ETB'}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                            <span>Clicks: {link.clicks_count || 0}</span>
                            <span>Conversions: {link.conversions_count || 0}</span>
                            <span>Commission: ETB {((link as any).total_commission || 0).toFixed(2)}</span>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3 mb-3">
                            <p className="text-sm font-mono text-slate-700 break-all">{link.url}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-slate-600">Code:</p>
                            <code className="text-sm bg-slate-100 px-2 py-1 rounded">{link.code}</code>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(link)}
                            className="border-slate-300"
                          >
                            {copiedCode === link.code ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Link
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="border-slate-300"
                          >
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Test Link
                            </a>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

