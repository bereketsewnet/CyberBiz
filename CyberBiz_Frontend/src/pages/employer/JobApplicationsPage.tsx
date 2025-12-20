import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { JobPosting, Application } from '@/types';

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [jobRes, appsRes] = await Promise.all([
          apiService.getJob(id),
          apiService.getJobApplications(id),
        ]);
        setJob(jobRes.data);
        setApplications(appsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDownloadCV = async (applicationId: string) => {
    try {
      await apiService.downloadCV(applicationId);
      toast.success('CV downloaded');
    } catch (error) {
      toast.error('Failed to download CV');
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back to My Jobs
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Applications for "{job?.title}"</h1>
            <p className="text-muted-foreground">{applications.length} application{applications.length !== 1 ? 's' : ''} received</p>
          </motion.div>

          {applications.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No applications yet</h3>
              <p className="text-muted-foreground">Applications will appear here when candidates apply</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-display font-bold text-primary">{app.seeker?.full_name?.charAt(0) || 'A'}</span>
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-foreground">{app.seeker?.full_name || 'Anonymous'}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {app.seeker?.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{app.seeker.email}</span>}
                            {app.seeker?.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{app.seeker.phone}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Applied {new Date(app.created_at).toLocaleDateString()}</span>
                        <Badge variant="outline">{app.cv_original_name}</Badge>
                      </div>
                      {app.cover_letter && (
                        <div className="bg-muted/50 rounded-lg p-4 text-sm">
                          <p className="font-medium text-foreground mb-2">Cover Letter:</p>
                          <p className="text-muted-foreground">{app.cover_letter}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadCV(app.id)}>
                        <Download className="w-4 h-4 mr-2" />Download CV
                      </Button>
                      <Button size="sm" className="bg-gold-gradient">Contact</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
