import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, ExternalLink, MousePointerClick, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import type { AffiliateProgram } from '@/types';

export default function AffiliateProgramsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAffiliatePrograms();
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching affiliate programs:', error);
      toast.error('Failed to load affiliate programs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinProgram = async (programId: number) => {
    if (!user) {
      toast.error('Please login to join affiliate programs');
      navigate('/login');
      return;
    }

    try {
      await apiService.joinAffiliateProgram(programId.toString());
      toast.success('Successfully joined affiliate program!');
      navigate('/affiliate/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join affiliate program');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="border-b" style={{ backgroundColor: '#0F172A', borderColor: 'rgb(30 41 59)', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Affiliate Programs
              </h1>
              <p className="text-xl text-slate-300 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                Join our affiliate programs and earn commissions by promoting our services
              </p>
            </motion.div>
          </div>
        </section>

        {/* Programs List */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 h-80 animate-pulse" />
                ))}
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No affiliate programs available</h3>
                <p className="text-slate-600">Check back later for new affiliate opportunities</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program, index) => (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-slate-900">{program.name}</h3>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>

                    {program.description && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">{program.description}</p>
                    )}

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span>
                          <strong>Commission:</strong> {program.type === 'percentage' 
                            ? `${Number(program.commission_rate).toFixed(1)}%` 
                            : `${Number(program.commission_rate).toFixed(2)} ETB`} ({program.type})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          <strong>Cookie Duration:</strong> {program.cookie_duration} days
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <span>
                          <strong>Links:</strong> {program.active_links_count || 0} active / {program.links_count || 0} total
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                        <span className="truncate">
                          <strong>Target URL:</strong>{' '}
                          <a
                            href={program.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {program.target_url}
                          </a>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <Button
                        onClick={() => handleJoinProgram(program.id)}
                        className="flex-1 bg-primary hover:bg-accent"
                      >
                        Join Program
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        {user && (
          <section className="py-12 bg-slate-50 border-y border-slate-200">
            <div className="container mx-auto px-4 lg:px-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Manage Your Affiliate Links</h2>
              <p className="text-slate-600 mb-6">View your affiliate dashboard to track clicks, conversions, and commissions</p>
              <Button
                onClick={() => navigate('/affiliate/dashboard')}
                className="bg-primary hover:bg-accent"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

