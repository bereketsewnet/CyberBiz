import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import type { AdSlot } from '@/types';
import { getImageUrl } from '@/lib/imageUtils';

interface AdDisplayProps {
  position: 'SIDEBAR' | 'JOB_DETAIL' | 'HOME_HEADER';
  className?: string;
}

// Note: Backend uses JOB_DETAIL, but frontend types show JOBS_BANNER - we'll use JOB_DETAIL to match backend

export function AdDisplay({ position, className = '' }: AdDisplayProps) {
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAds, setHasAds] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await apiService.getAds(position);
        // Public API already filters for active ads, so all returned ads are active
        setAds(response.data);
        setHasAds(response.data.length > 0);
      } catch (error) {
        console.error('Error fetching ads:', error);
        setHasAds(false);
        setAds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAds();
  }, [position]);

  if (isLoading || !hasAds || ads.length === 0) {
    return null;
  }

  // For now, display the first active ad
  const ad = ads[0];

  const handleClick = () => {
    if (ad.target_url) {
      window.open(ad.target_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={className}>
      {position === 'HOME_HEADER' ? (
        <section className="py-10">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="w-full mb-6">
              <a
                href={ad.target_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="block w-full"
              >
                <img
                  src={getImageUrl(ad.image_url)}
                  alt="Advertisement"
                  className="w-full h-auto rounded-lg object-cover"
                />
              </a>
            </div>
          </div>
        </section>
      ) : (
        <div className="bg-card rounded-xl border border-border p-4">
          <a
            href={ad.target_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="block"
          >
            <img
              src={getImageUrl(ad.image_url)}
              alt="Advertisement"
              className="w-full h-auto rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      )}
    </div>
  );
}

