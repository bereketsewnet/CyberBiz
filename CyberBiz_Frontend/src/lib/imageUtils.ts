/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Storage is served from the API origin (api.cyberbizafrica.com or localhost:8000)
// Remove /api from pathname but keep the hostname as-is (preserves api. subdomain)
const STORAGE_ORIGIN = (() => {
  try {
    const apiUrl = new URL(API_BASE_URL);
    // Remove /api from pathname if present, keep hostname unchanged (preserves api. subdomain)
    apiUrl.pathname = apiUrl.pathname.replace(/^\/api/, '');
    return apiUrl.origin;
  } catch {
    // Fallback: just remove /api if it's in the string
    return API_BASE_URL.replace('/api', '').replace(/\/$/, '');
  }
})();

/**
 * Converts a relative storage URL to an absolute URL if needed
 * @param url - The image URL (can be relative or absolute)
 * @returns The absolute URL
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  // If absolute URL, rewrite localhost/127 origins to the deployed API origin
  // But preserve api. subdomain for production URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      const isLocal =
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.port === '8000';
      
      // If it's localhost, rewrite to API origin (which may have api. subdomain in production)
      if (isLocal) {
        return `${STORAGE_ORIGIN}${parsed.pathname}${parsed.search || ''}`;
      }
      
      // If URL is missing api. subdomain but we're in production with api. subdomain, add it
      // This handles cases where database has cyberbizafrica.com but should be api.cyberbizafrica.com
      try {
        const storageUrl = new URL(STORAGE_ORIGIN);
        if (storageUrl.hostname.startsWith('api.') && !parsed.hostname.startsWith('api.')) {
          // Check if the hostname without api. matches
          const mainDomain = storageUrl.hostname.replace('api.', '');
          if (parsed.hostname === mainDomain) {
            // Rewrite to use api. subdomain
            parsed.hostname = storageUrl.hostname;
            return parsed.toString();
          }
        }
      } catch {
        // Ignore errors in subdomain check
      }
      
      // Otherwise return as-is (preserves api. subdomain if already present)
    } catch (_) {
      // Fall through to return as-is below
    }
    return url;
  }

  // If it's a relative URL starting with /storage, prepend the API origin (with api. subdomain)
  if (url.startsWith('/storage/')) {
    return `${STORAGE_ORIGIN}${url}`;
  }

  // If it's any other relative URL, prepend storage origin
  return `${STORAGE_ORIGIN}${url.startsWith('/') ? url : '/' + url}`;
}

