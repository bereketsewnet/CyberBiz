import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

interface NewsletterSignupProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function NewsletterSignup({ variant = 'default', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.subscribeNewsletter({
        email: email.trim(),
        name: name.trim() || undefined,
      });
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      setName('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border-slate-300"
          required
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-accent"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
        </Button>
      </form>
    );
  }

  return (
    <div className={`bg-slate-50 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-slate-900">Subscribe to Newsletter</h3>
      </div>
      <p className="text-slate-600 mb-4">
        Stay updated with the latest news, tips, and exclusive offers from CyberBiz Africa.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-slate-300"
        />
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-slate-300"
          required
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-accent"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Subscribe
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

