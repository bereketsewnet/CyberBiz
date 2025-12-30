import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header, Footer } from '@/components/layout';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';

interface SiteSettings {
  address?: string;
  email?: string;
  phone?: string;
}

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiService.getPublicSiteSettings();
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Send email via backend API
      await apiService.sendContactMessage({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        message: data.message,
      });
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error?.message || 'Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16" style={{ backgroundColor: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Contact Us
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                We promise, your message won't disappear into the abyss. We're standing by and ready to help with any questions, comments, or thoughts you may have.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Talk to us for any questions
                  </h2>
                  <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Get in touch with us through any of the following channels. We're here to help!
                  </p>
                </div>

                <div className="space-y-6">
                  {settings.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Phone Number</h3>
                        <a 
                          href={`tel:${settings.phone.replace(/\s/g, '')}`} 
                          className="text-slate-600 hover:text-primary transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {settings.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {settings.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Email</h3>
                        <a 
                          href={`mailto:${settings.email}`} 
                          className="text-slate-600 hover:text-primary transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {settings.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {settings.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Address</h3>
                        <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {settings.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isLoadingSettings && !settings.address && !settings.email && !settings.phone && (
                    <div className="text-slate-600 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Contact information will be displayed here once configured.
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Let's Chat!
                  </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        {...register('firstName')}
                        className={errors.firstName ? 'border-destructive' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        {...register('lastName')}
                        className={errors.lastName ? 'border-destructive' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register('email')}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Comment or Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      {...register('message')}
                      className={errors.message ? 'border-destructive' : ''}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-accent transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

