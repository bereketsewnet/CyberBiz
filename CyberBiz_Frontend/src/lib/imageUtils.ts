/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Converts a relative storage URL to an absolute URL if needed
 * @param url - The image URL (can be relative or absolute)
 * @returns The absolute URL
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // If it's already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative URL starting with /storage, prepend the API base URL (without /api)
  if (url.startsWith('/storage/')) {
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${url}`;
  }
  
  // If it's any other relative URL, prepend API base URL
  return `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
}

