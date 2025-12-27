/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BASE_ORIGIN = API_BASE_URL.replace('/api', '');

/**
 * Converts a relative storage URL to an absolute URL if needed
 * @param url - The image URL (can be relative or absolute)
 * @returns The absolute URL
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  // If absolute URL, rewrite localhost/127 origins to the deployed API origin
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      const isLocal =
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1';
      if (isLocal) {
        return `${BASE_ORIGIN}${parsed.pathname}${parsed.search || ''}`;
      }
    } catch (_) {
      // Fall through to return as-is below
    }
    return url;
  }

  // If it's a relative URL starting with /storage, prepend the API base URL (without /api)
  if (url.startsWith('/storage/')) {
    return `${BASE_ORIGIN}${url}`;
  }

  // If it's any other relative URL, prepend API base URL
  return `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
}

