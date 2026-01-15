import { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { apiService } from '@/services/apiService';
import type { NativeAd } from '@/types';

interface NativeAdDisplayProps {
  position: 'content_inline' | 'sidebar' | 'footer' | 'between_posts' | 'after_content';
  className?: string;
  limit?: number;
}

export function NativeAdDisplay({ position, className = '', limit = 1 }: NativeAdDisplayProps) {
  const [ads, setAds] = useState<NativeAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [position, limit]);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getNativeAds({ position, limit });
      setAds(response.data);
    } catch (error) {
      console.error('Error fetching native ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async (ad: NativeAd) => {
    try {
      const response = await apiService.trackNativeAdClick(ad.id.toString());
      // Open in new tab
      window.open(response.redirect_url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking click:', error);
      // Still open the link even if tracking fails
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading || ads.length === 0) {
    return null;
  }

  return (
    <div className={`native-ad-container ${className}`}>
      {ads.map((ad) => (
        <div
          key={ad.id}
          className="native-ad bg-slate-50 rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleClick(ad)}
        >
          {ad.image_url && (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          )}
          <div className="flex items-start gap-2 mb-2">
            {ad.type === 'sponsored' && (
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                Sponsored
              </span>
            )}
            {ad.type === 'promoted' && (
              <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Promoted
              </span>
            )}
            {ad.advertiser_name && (
              <span className="text-xs text-slate-500">{ad.advertiser_name}</span>
            )}
          </div>
          <h4 className="font-semibold text-slate-900 mb-1">{ad.title}</h4>
          {ad.description && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{ad.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-primary">
            <span>Learn More</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

