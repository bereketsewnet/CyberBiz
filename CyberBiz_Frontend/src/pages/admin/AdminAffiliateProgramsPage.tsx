import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ExternalLink, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { AffiliateProgram } from '@/types';

export default function AdminAffiliateProgramsPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAdminAffiliatePrograms();
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching affiliate programs:', error);
      toast.error('Failed to load affiliate programs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (programId: number) => {
    if (!confirm('Are you sure you want to delete this affiliate program?')) return;

    try {
      await apiService.deleteAffiliateProgram(programId.toString());
      toast.success('Affiliate program deleted successfully');
      fetchPrograms();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete affiliate program');
    }
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
                  Affiliate Programs
                </h1>
                <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Manage affiliate marketing programs
                </p>
              </div>
              <Button asChild className="bg-primary hover:bg-accent transition-colors">
                <Link to="/admin/affiliate/programs/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Program
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-lg p-6 h-32 animate-pulse" />
                ))}
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No affiliate programs found</h3>
                <p className="text-slate-600 mb-4">Get started by creating your first affiliate program</p>
                <Button asChild className="bg-primary hover:bg-accent">
                  <Link to="/admin/affiliate/programs/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Program
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {programs.map((program) => (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-slate-900">{program.name}</h3>
                          {program.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        {program.description && (
                          <p className="text-slate-600 mb-3">{program.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                          <span>
                            <strong>Commission:</strong> {program.type === 'percentage' 
                              ? `${Number(program.commission_rate).toFixed(1)}%` 
                              : `${Number(program.commission_rate).toFixed(2)} ETB`} ({program.type})
                          </span>
                          <span><strong>Cookie Duration:</strong> {program.cookie_duration} days</span>
                          <span>
                            <strong>Links:</strong> {program.active_links_count || 0} active / {program.links_count || 0} total
                          </span>
                          {program.total_clicks !== undefined && (
                            <span><strong>Clicks:</strong> {program.total_clicks}</span>
                          )}
                          {program.total_conversions !== undefined && (
                            <span><strong>Conversions:</strong> {program.total_conversions}</span>
                          )}
                          {program.total_commission !== undefined && (
                            <span>
                              <strong>Total Commission:</strong> {program.total_commission.toFixed(2)}
                              {program.type === 'percentage' ? '%' : ' ETB'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500">
                          <span>Target URL: </span>
                          <a
                            href={program.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {program.target_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/affiliate/programs/${program.id}/edit`)}
                          className="border-slate-300"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/affiliate/links?program_id=${program.id}`)}
                          className="border-slate-300"
                        >
                          View Links
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(program.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
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

