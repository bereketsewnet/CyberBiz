import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const requiresPhone = searchParams.get('requires_phone') === '1';

    if (error) {
      toast.error(error);
      navigate('/login');
      return;
    }

    if (!token) {
      toast.error('Authentication failed. No token received.');
      navigate('/login');
      return;
    }

    // Fetch user data with the token
    const authenticateUser = async () => {
      try {
        // Store token temporarily
        useAuthStore.getState().login(null, token);
        
        // Fetch user data
        const response = await apiService.getUser();
        
        // Update auth store with user data
        login(response.user, token);
        
        toast.success('Successfully signed in!');
        
        // If phone is required, redirect to profile to update it
        if (requiresPhone) {
          toast.info('Please update your phone number in your profile');
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      } catch (error: any) {
        console.error('Error fetching user:', error);
        toast.error('Failed to authenticate. Please try again.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    authenticateUser();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

