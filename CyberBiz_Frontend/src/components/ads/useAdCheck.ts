import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

export function useAdCheck(position: 'SIDEBAR' | 'JOB_DETAIL' | 'HOME_HEADER') {
  const [hasAds, setHasAds] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAds = async () => {
      try {
        const response = await apiService.getAds(position);
        // Public API already filters for active ads, so all returned ads are active
        setHasAds(response.data.length > 0);
      } catch (error) {
        console.error('Error checking ads:', error);
        setHasAds(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAds();
  }, [position]);

  return { hasAds, isLoading };
}

