import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, DollarSign, Briefcase, ArrowRight, Megaphone, Palette, Code } from 'lucide-react';
import type { JobPosting } from '@/types';

interface FeaturedJobCardProps {
  job: JobPosting;
  index?: number;
}

export function FeaturedJobCard({ job, index = 0 }: FeaturedJobCardProps) {
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

  // Determine icon based on job title keywords
  const getJobIcon = () => {
    const titleLower = job.title.toLowerCase();
    
    // Marketing related
    if (titleLower.includes('marketing') || titleLower.includes('seo') || titleLower.includes('social media')) {
      return { icon: Megaphone, bgColor: 'bg-blue-900/30', textColor: 'text-blue-400' };
    }
    
    // Design related
    if (titleLower.includes('designer') || titleLower.includes('design') || titleLower.includes('ui/ux') || titleLower.includes('ux/ui')) {
      return { icon: Palette, bgColor: 'bg-purple-900/30', textColor: 'text-purple-400' };
    }
    
    // Code/Developer/DevOps related
    if (titleLower.includes('developer') || titleLower.includes('engineer') || titleLower.includes('devops') || 
        titleLower.includes('programmer') || titleLower.includes('software') || titleLower.includes('backend') || 
        titleLower.includes('frontend') || titleLower.includes('full stack') || titleLower.includes('code')) {
      return { icon: Code, bgColor: 'bg-orange-900/30', textColor: 'text-orange-400' };
    }
    
    // Default/Business
    return { icon: Briefcase, bgColor: 'bg-blue-900/30', textColor: 'text-blue-400' };
  };

  const { icon: JobIcon, bgColor, textColor } = getJobIcon();

  // Get badge info
  const getBadge = () => {
    const locationLower = job.location?.toLowerCase() || '';
    if (locationLower.includes('remote')) {
      return { label: 'Remote', bgColor: 'bg-green-900', textColor: 'text-green-200' };
    }
    if (isExpiringSoon()) {
      return { label: 'Closing Soon', bgColor: 'bg-red-900', textColor: 'text-red-200', animate: 'animate-pulse' };
    }
    if (job.job_type === 'FULL_TIME') {
      return { label: 'Full Time', bgColor: 'bg-blue-900', textColor: 'text-blue-200' };
    }
    if (job.job_type === 'PART_TIME') {
      return { label: 'Part Time', bgColor: 'bg-blue-900', textColor: 'text-blue-200' };
    }
    return null;
  };

  const badge = getBadge();

  // Get secondary info (salary or location or experience)
  const getSecondaryInfo = () => {
    // If remote, show salary placeholder (since we don't have salary in the API, we'll show "Competitive")
    if (job.location?.toLowerCase().includes('remote')) {
      return { icon: DollarSign, text: 'Competitive' };
    }
    // If has location, show location
    if (job.location && !job.location.toLowerCase().includes('remote')) {
      return { icon: MapPin, text: job.location };
    }
    // If has experience, show experience
    if (job.experience) {
      return { icon: Briefcase, text: job.experience };
    }
    // Default to competitive
    return { icon: DollarSign, text: 'Competitive' };
  };

  const secondaryInfo = getSecondaryInfo();
  const SecondaryIcon = secondaryInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group p-6 rounded-2xl shadow-sm transition-all duration-300"
      style={{ 
        backgroundColor: '#1E293B',
        border: '1px solid rgb(51 65 85)',
        fontFamily: 'Inter, sans-serif'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = 'rgb(51 65 85)';
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${textColor}`}>
            <JobIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 
              className="text-lg font-bold text-white transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
            >
              {job.title}
            </h3>
            <p className="text-sm text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>{getCompanyName()}</p>
          </div>
        </div>
        {badge && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bgColor} ${badge.textColor} ${badge.animate || ''}`}>
            {badge.label}
          </span>
        )}
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Posted {formatDate(job.created_at)}
        </span>
        <span className="flex items-center gap-1">
          <SecondaryIcon className="w-3 h-3" />
          {secondaryInfo.text}
        </span>
      </div>
      
      <p className="mt-4 text-sm text-slate-300 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        {job.description_html ? job.description_html.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No description available'}
      </p>
      
      <div className="mt-6 pt-4 flex justify-end" style={{ borderTop: '1px solid rgb(51 65 85)' }}>
        <Link 
          to={`/jobs/${job.id}`}
          className="text-sm font-semibold text-white flex items-center gap-1 transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
        >
          View Details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

