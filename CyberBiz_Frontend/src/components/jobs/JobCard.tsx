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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-card rounded-xl border border-border p-6 card-hover"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
            </h3>
            <p className="text-muted-foreground text-sm">{getCompanyName()}</p>
          </div>
        </div>
        {isExpiringSoon() && (
          <Badge variant="destructive" className="shrink-0">
            Closing Soon
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          Addis Ababa
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

      <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
        {job.description_html ? job.description_html.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No description available'}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="secondary">Full-time</Badge>
          <Badge variant="outline">Remote</Badge>
        </div>
        <Button asChild variant="ghost" size="sm" className="group/btn">
          <Link to={`/jobs/${job.id}`}>
            View Details
            <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
