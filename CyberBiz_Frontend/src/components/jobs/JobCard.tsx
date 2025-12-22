import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { JobPosting } from '@/types';

interface JobCardProps {
  job: JobPosting;
  index?: number;
}

export function JobCard({ job, index = 0 }: JobCardProps) {
  const getCompanyName = () => {
    return job.employer?.full_name || 'Company Name';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = () => {
    if (!job.expires_at) return false;
    const expiryDate = new Date(job.expires_at);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const getJobTypeLabel = (type?: string) => {
    if (!type) return 'Full-time';
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-card rounded-xl border border-border p-4 sm:p-6 card-hover h-full flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
              <Link to={`/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm truncate">{getCompanyName()}</p>
          </div>
        </div>
        {isExpiringSoon() && (
          <Badge variant="destructive" className="shrink-0 text-xs">
            Closing Soon
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">{job.location}</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="whitespace-nowrap">Posted {formatDate(job.created_at)}</span>
        </span>
        {job.applications_count !== undefined && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{job.applications_count} applicants</span>
          </span>
        )}
      </div>

      <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-4 sm:mb-6 flex-1">
        {job.description_html ? job.description_html.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No description available'}
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex flex-wrap gap-2">
          {job.job_type && (
            <Badge variant="secondary" className="text-xs">{getJobTypeLabel(job.job_type)}</Badge>
          )}
          {job.location?.toLowerCase().includes('remote') && (
            <Badge variant="outline" className="text-xs">Remote</Badge>
          )}
        </div>
        <Button asChild variant="ghost" size="sm" className="group/btn w-full sm:w-auto">
          <Link to={`/jobs/${job.id}`} className="flex items-center justify-center">
            <span className="text-xs sm:text-sm">View Details</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
