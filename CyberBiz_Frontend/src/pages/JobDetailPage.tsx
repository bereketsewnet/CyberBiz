import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, Clock, Users, Bookmark, ExternalLink, Upload, Share2, Facebook, Twitter, Send, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { JobPosting } from '@/types';
import { NativeAdDisplay } from '@/components/ads/NativeAdDisplay';
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
  const [hasApplied, setHasApplied] = useState(false);
  const [isCheckingApplication, setIsCheckingApplication] = useState(true);
  const [isDeletingApplication, setIsDeletingApplication] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        const [jobResponse, favoriteResponse, myApplication] = await Promise.all([
          apiService.getJob(id),
          isAuthenticated ? apiService.checkJobFavorite(id).catch(() => ({ is_favorite: false })) : Promise.resolve({ is_favorite: false }),
          isAuthenticated && (user?.role === 'SEEKER' || user?.role === 'LEARNER')
            ? apiService.getMyApplicationForJob(id).catch(() => ({ has_applied: false, data: null }))
            : Promise.resolve({ has_applied: false, data: null }),
        ]);
        setJob(jobResponse.data);
        setIsFavorite(favoriteResponse.is_favorite);
        setHasApplied((myApplication as any).has_applied || false);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setIsLoading(false);
        setIsCheckingApplication(false);
      }
    };
    fetchJob();
  }, [id, navigate, isAuthenticated, user]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to apply');
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (user?.role !== 'SEEKER' && user?.role !== 'LEARNER') {
      toast.error('Only job seekers and learners can apply for jobs');
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
      setHasApplied(true);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error(error.response.data?.message || 'You have already applied for this job');
        setShowApplyModal(false);
        setHasApplied(true);
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to submit application');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete your application and CV for this job?')) {
      return;
    }

    setIsDeletingApplication(true);
    try {
      await apiService.deleteMyApplicationForJob(id);
      toast.success('Your application has been deleted. You can apply again if you wish.');
      setHasApplied(false);
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete application');
    } finally {
      setIsDeletingApplication(false);
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

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleNativeShare = async () => {
    if (!job || !navigator.share) return;
    const shareData = {
      title: job.title,
      text: job.company_description || job.title,
      url: currentUrl,
    };
    if (navigator.canShare && !navigator.canShare(shareData)) {
      toast.error('Sharing is not supported on this device');
      return;
    }
    try {
      setIsSharing(true);
      await navigator.share(shareData);
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Unable to share right now');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  const openShareWindow = (url: string) => {
    const w = 600;
    const h = 600;
    const left = window.screenX + (window.innerWidth - w) / 2;
    const top = window.screenY + (window.innerHeight - h) / 2;
    window.open(url, '_blank', `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`);
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
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      
      <main className="flex-1">
        {/* Header */}
        <section className="border-b" style={{ backgroundColor: '#0F172A', borderColor: 'rgb(30 41 59)', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
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
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {job.title}
                  </h1>
                  <p className="text-lg text-slate-400 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {job.employer?.full_name || 'Company Name'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location || 'Addis Ababa, Ethiopia'}
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
                  className={isFavorite ? 'border-primary bg-primary/20 text-primary' : ''}
                  style={!isFavorite ? {
                    borderColor: 'rgb(100 116 139)',
                    color: '#ffffff',
                    backgroundColor: 'transparent'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (!isFavorite) {
                      e.currentTarget.style.backgroundColor = 'rgb(30 41 59)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFavorite) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShareOpen(true)}
                  className="border-slate-500 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:text-white"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                {(user?.role === 'SEEKER' || user?.role === 'LEARNER') && (
                  hasApplied ? (
                    <div className="flex items-center gap-3">
                      <Button
                        size="lg"
                        variant="outline"
                        disabled
                        className="border-green-500 text-green-700 bg-green-50"
                      >
                        Application Submitted
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteApplication}
                        disabled={isDeletingApplication}
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        {isDeletingApplication ? 'Removing...' : 'Remove Application'}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-accent transition-colors"
                      onClick={handleApplyClick}
                      disabled={isCheckingApplication}
                    >
                      Apply Now
                    </Button>
                  )
                )}
                {(!user || (user?.role !== 'SEEKER' && user?.role !== 'LEARNER')) && (
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-accent transition-colors"
                    onClick={handleApplyClick}
                  >
                    Apply Now
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-10 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Main Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
              >
                <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8">
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
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-lg mb-4 text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>Job Overview</h3>
                  <div className="space-y-4">
                    {job.job_type && (
                      <div className="flex justify-between">
                        <span className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>Job Type</span>
                        <span className="font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {job.job_type.replace('_', '-').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                    {job.location && (
                      <div className="flex justify-between">
                        <span className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>Location</span>
                        <span className="font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>{job.location}</span>
                      </div>
                    )}
                    {job.experience && (
                      <div className="flex justify-between">
                        <span className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>Experience</span>
                        <span className="font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>{job.experience}</span>
                      </div>
                    )}
                    {job.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>Deadline</span>
                        <span className="font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>{formatDate(job.expires_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {job.skills && job.skills.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-lg mb-4 text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Company */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-lg mb-4 text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>About the Company</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>{job.employer?.full_name || job.employer?.company_name || 'Company'}</p>
                      {job.employer?.company_name && job.employer?.company_name !== job.employer?.full_name && (
                        <p className="text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>{job.employer.company_name}</p>
                      )}
                    </div>
                  </div>
                  {job.company_description && (
                    <p className="text-sm text-slate-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {job.company_description}
                    </p>
                  )}
                  {!job.company_description && (
                    <p className="text-sm text-slate-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      No company description available.
                    </p>
                  )}
                  {job.employer?.website_url && (
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-accent hover:text-white hover:border-accent transition-colors border-slate-300" 
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

                {/* Job Detail Native Ad */}
                <NativeAdDisplay position="sidebar" />
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Share dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {navigator.share && (
              <Button
                type="button"
                className="w-full bg-primary hover:bg-accent justify-center"
                onClick={handleNativeShare}
                disabled={isSharing}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isSharing ? 'Sharing…' : 'Share via device'}
              </Button>
            )}

            <div className="grid grid-cols-3 gap-3 text-sm">
              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  openShareWindow(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
                  )
                }
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Facebook className="w-4 h-4 text-blue-600" />
                </div>
                <span>Facebook</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  openShareWindow(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(
                      job.title || ''
                    )}`
                  )
                }
              >
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-sky-500" />
                </div>
                <span>Twitter</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  openShareWindow(
                    `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(
                      job.title || ''
                    )}`
                  )
                }
              >
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
                  <Send className="w-4 h-4 text-sky-600" />
                </div>
                <span>Telegram</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  openShareWindow(
                    `https://wa.me/?text=${encodeURIComponent((job.title || '') + ' ' + currentUrl)}`
                  )
                }
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                onClick={handleCopyLink}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-slate-700" />
                </div>
                <span>Copy link</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            <Button variant="outline" onClick={() => setShowApplyModal(false)} className="border-slate-300">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!cvFile || isApplying}
              className="bg-primary hover:bg-accent transition-colors"
            >
              {isApplying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
