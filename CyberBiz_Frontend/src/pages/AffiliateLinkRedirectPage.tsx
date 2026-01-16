import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

export default function AffiliateLinkRedirectPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const isValidUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      // Check if it's a valid http or https URL
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const trackClickAndRedirect = async () => {
      if (!code) {
        setError('Invalid affiliate link code');
        setIsRedirecting(false);
        return;
      }

      try {
        // Track the click
        const response = await apiService.trackAffiliateClick(code);
        
        // Validate and redirect to the target URL
        if (response.redirect_url && isValidUrl(response.redirect_url)) {
          setRedirectUrl(response.redirect_url);
          
          // Attempt to redirect after a short delay (reduce to 500ms for faster redirect)
          setTimeout(() => {
            try {
              // Use replace instead of href for cleaner redirect
              window.location.replace(response.redirect_url);
            } catch (err) {
              console.error('Redirect error:', err);
              setError(`Unable to redirect to: ${response.redirect_url}`);
              setIsRedirecting(false);
            }
          }, 500);
        } else {
          setError(
            response.redirect_url 
              ? `Invalid or unreachable redirect URL: ${response.redirect_url}`
              : 'No redirect URL provided'
          );
          setIsRedirecting(false);
        }
      } catch (error: any) {
        console.error('Error tracking affiliate click:', error);
        const errorMessage = error.message || 'Failed to process affiliate link';
        setError(errorMessage);
        setIsRedirecting(false);
        
        // Still redirect to home after showing error
        setTimeout(() => {
          navigate('/');
        }, 5000);
      }
    };

    trackClickAndRedirect();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Redirect Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          {redirectUrl && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Target URL:</p>
              <a
                href={redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all text-sm"
              >
                {redirectUrl}
                <ExternalLink className="w-3 h-3 inline-block ml-1" />
              </a>
            </div>
          )}
          <Button onClick={() => navigate('/')} className="mt-4">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Redirecting...</h2>
        <p className="text-slate-600 mb-4">Please wait while we redirect you</p>
        {redirectUrl && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Taking you to:</p>
            <a
              href={redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all text-sm font-medium inline-flex items-center gap-1"
            >
              {redirectUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-xs text-slate-500 mt-2">
              Click the link above if you're not redirected automatically
            </p>
          </div>
        )}
        {!redirectUrl && (
          <p className="text-sm text-slate-500 mt-2">Preparing redirect...</p>
        )}
      </div>
    </div>
  );
}

