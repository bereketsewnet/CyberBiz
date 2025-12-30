import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { JobPosting } from '@/types';

export default function AdminJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchQuery]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAdminJobs({
        q: searchQuery || undefined,
        page: currentPage,
      });
      setJobs(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await apiService.deleteJob(jobId);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-success">Published</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Manage Jobs</h1>
              <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>View, edit, and delete job postings</p>
            </div>
            <Button asChild className="bg-primary hover:bg-accent transition-colors">
              <Link to="/admin/jobs/create"><Plus className="w-4 h-4 mr-2" />Create Job</Link>
            </Button>
          </motion.div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 border-slate-300"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200" style={{ fontFamily: 'Inter, sans-serif' }}>
              <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>No jobs found</h3>
              <p className="text-slate-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>{searchQuery ? 'Try a different search term' : 'No jobs have been posted yet'}</p>
              {!searchQuery && <Button asChild className="bg-primary hover:bg-accent transition-colors"><Link to="/admin/jobs/create"><Plus className="w-4 h-4 mr-2" />Create First Job</Link></Button>}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{job.title}</h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <span>Employer: {job.employer?.full_name || 'Unknown'}</span>
                          <span>Created {new Date(job.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{job.applications_count || 0} applications</span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {job.description_html ? job.description_html.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="border-slate-300">
                          <Link to={`/jobs/${job.id}`}><Eye className="w-4 h-4 mr-2" />View Details</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="border-slate-300">
                          <Link to={`/admin/jobs/${job.id}/edit`}><Edit className="w-4 h-4 mr-2" />Edit</Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-colors">
                    Previous
                  </Button>
                  <div className="flex items-center px-4 text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-colors">
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

