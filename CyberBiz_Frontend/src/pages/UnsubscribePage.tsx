import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.unsubscribeNewsletter(email.trim());
      setIsUnsubscribed(true);
      toast.success('Successfully unsubscribed from newsletter');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unsubscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                {isUnsubscribed ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Unsubscribed Successfully</h1>
                    <p className="text-slate-600 mb-6">
                      You have been successfully unsubscribed from our newsletter. You will no longer receive emails from us.
                    </p>
                    <Button asChild className="bg-primary hover:bg-accent">
                      <a href="/">Go to Homepage</a>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-slate-600" />
                      </div>
                      <h1 className="text-2xl font-bold text-slate-900 mb-2">Unsubscribe from Newsletter</h1>
                      <p className="text-slate-600">
                        Enter your email address to unsubscribe from our newsletter
                      </p>
                    </div>

                    <form onSubmit={handleUnsubscribe} className="space-y-4">
                      <div>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-slate-300"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-accent"
                      >
                        {isSubmitting ? 'Unsubscribing...' : 'Unsubscribe'}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

