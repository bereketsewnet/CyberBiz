import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    shouldFocusError: true,
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(data.email, data.password);
      login(response.user, response.token);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Invalid email or password';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Show error toast
      toast.error(errorMessage);
      
      // Set form error to display below password field
      setError('password', {
        type: 'manual',
        message: errorMessage,
      });
      
      // Don't clear the form - keep email and password fields filled
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img 
              src="/logo.svg" 
              alt="CyberBiz Africa" 
              className="h-10 w-auto"
            />
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to your account to continue
          </p>

          {/* Demo Credentials */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm">
            <p className="font-medium text-foreground mb-2">Demo Credentials:</p>
            <p className="text-muted-foreground">Admin: admin@cyberbiz.africa</p>
            <p className="text-muted-foreground">Employer: employer1@cyberbiz.africa</p>
            <p className="text-muted-foreground">Seeker: seeker1@cyberbiz.africa</p>
            <p className="text-muted-foreground">Learner: learner@cyberbiz.africa</p>
            <p className="text-muted-foreground mt-1">Password: password123</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={async () => {
                    const email = (document.getElementById('email') as HTMLInputElement)?.value;
                    if (!email) {
                      toast.error('Please enter your email first');
                      return;
                    }
                    try {
                      const response = await apiService.forgotPassword(email);
                      toast.info(response.message);
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to process forgot password request');
                    }
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:opacity-90 "
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>


          <p className="text-center text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
              <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Image/Pattern */}
      <div className="hidden lg:flex flex-1 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="text-center max-w-lg">
            <h2 className="font-display text-4xl font-bold text-secondary-foreground mb-4">
              Find Your Dream Job in Africa
            </h2>
            <p className="text-secondary-foreground/70 text-lg">
              Connect with top employers, build your skills, and advance your career with CyberBiz Africa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
