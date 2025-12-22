import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, Clock, Users, Bookmark, ExternalLink, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { JobPosting } from '@/types';
import { AdDisplay } from '@/components/ads/AdDisplay';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        const [jobResponse, favoriteResponse] = await Promise.all([
          apiService.getJob(id),
          isAuthenticated ? apiService.checkJobFavorite(id).catch(() => ({ is_favorite: false })) : Promise.resolve({ is_favorite: false }),
        ]);
        setJob(jobResponse.data);
        setIsFavorite(favoriteResponse.is_favorite);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate, isAuthenticated]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to apply');
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (user?.role !== 'SEEKER') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    setShowApplyModal(true);
  };

  const handleApply = async () => {
    if (!cvFile) {
      toast.error('Please upload your CV');
      return;
    }

    setIsApplying(true);
    try {
      await apiService.applyForJob(id!, cvFile, coverLetter || undefined);
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      setCvFile(null);
      setCoverLetter('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to favorite jobs');
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    setIsTogglingFavorite(true);
    try {
      const response = await apiService.toggleJobFavorite(id!);
      setIsFavorite(response.is_favorite);
      toast.success(response.message);
    } catch (error) {
      toast.error('Failed to update favorite');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-start justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    {job.title}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-4">
                    {job.employer?.full_name || 'Company Name'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Addis Ababa, Ethiopia
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Posted {formatDate(job.created_at)}
                    </span>
                    {job.applications_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.applications_count} applicants
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                  className={isFavorite ? 'bg-primary/10 border-primary text-primary' : ''}
                >
                  <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="lg"
                  className="bg-primary hover:opacity-90 "
                  onClick={handleApplyClick}
                >
                  Apply Now
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-10">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Main Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
              >
                <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
                  <div
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.description_html }}
                  />
                </div>
              </motion.div>

              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Job Overview */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-semibold text-lg mb-4">Job Overview</h3>
                  <div className="space-y-4">
                    {job.job_type && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Job Type</span>
                        <span className="font-medium">
                          {job.job_type.replace('_', '-').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                    {job.location && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{job.location}</span>
                      </div>
                    )}
                    {job.experience && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience</span>
                        <span className="font-medium">{job.experience}</span>
                      </div>
                    )}
                    {job.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deadline</span>
                        <span className="font-medium">{formatDate(job.expires_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {job.skills && job.skills.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-display font-semibold text-lg mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Company */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-semibold text-lg mb-4">About the Company</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{job.employer?.full_name || job.employer?.company_name || 'Company'}</p>
                      {job.employer?.company_name && job.employer?.company_name !== job.employer?.full_name && (
                        <p className="text-sm text-muted-foreground">{job.employer.company_name}</p>
                      )}
                    </div>
                  </div>
                  {job.company_description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {job.company_description}
                    </p>
                  )}
                  {!job.company_description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      No company description available.
                    </p>
                  )}
                  {job.employer?.website_url && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      asChild
                    >
                      <a 
                        href={job.employer.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                </div>

                {/* Job Detail Ad */}
                <AdDisplay position="JOB_DETAIL" />
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Upload your CV and optionally add a cover letter
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>CV (PDF or DOCX) *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="cv-upload"
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  {cvFile ? (
                    <p className="text-sm font-medium">{cvFile.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
              <Textarea
                id="cover-letter"
                placeholder="Tell us why you're interested in this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!cvFile || isApplying}
              className="bg-primary"
            >
              {isApplying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
