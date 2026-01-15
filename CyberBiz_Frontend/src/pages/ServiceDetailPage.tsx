import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Building, MessageSquare, Briefcase, Code, Palette, BarChart3, Globe, Smartphone, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { Service } from '@/types';

const iconMap: Record<string, any> = {
  'briefcase': Briefcase,
  'code': Code,
  'palette': Palette,
  'bar-chart': BarChart3,
  'globe': Globe,
  'smartphone': Smartphone,
  'zap': Zap,
};

export default function ServiceDetailPage() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [existingInquiry, setExistingInquiry] = useState<{ id: number; status: string; created_at: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  useEffect(() => {
    if (idOrSlug) {
      fetchService();
    }
  }, [idOrSlug]);

  useEffect(() => {
    // Check for existing inquiry when email is entered
    if (formData.email && service) {
      const timeoutId = setTimeout(() => {
        checkExistingInquiry();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setExistingInquiry(null);
    }
  }, [formData.email, service]);

  const fetchService = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getService(idOrSlug!);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Service not found');
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingInquiry = async () => {
    if (!service || !formData.email) return;
    
    try {
      const response = await apiService.checkServiceInquiry(service.id.toString(), formData.email);
      if (response.exists && response.inquiry) {
        setExistingInquiry(response.inquiry);
      } else {
        setExistingInquiry(null);
      }
    } catch (error) {
      // Silently fail - just don't show existing inquiry
      setExistingInquiry(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (existingInquiry) {
      toast.error('You have already submitted an inquiry for this service. Please wait for our response.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.submitServiceInquiry(service!.id.toString(), formData);
      toast.success('Inquiry submitted successfully! We will contact you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
      });
      setExistingInquiry(null);
      // Re-check to update existing inquiry state
      setTimeout(() => checkExistingInquiry(), 1000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('You have already submitted an inquiry for this service. Please wait for our response.');
        checkExistingInquiry();
      } else {
        toast.error(error.message || 'Failed to submit inquiry');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInquiry = async () => {
    if (!service || !formData.email || !existingInquiry) return;

    if (!confirm('Are you sure you want to cancel this inquiry? You can submit a new one later if needed.')) {
      return;
    }

    setIsCancelling(true);
    try {
      await apiService.cancelServiceInquiry(service.id.toString(), formData.email);
      toast.success('Inquiry cancelled successfully');
      setExistingInquiry(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel inquiry');
    } finally {
      setIsCancelling(false);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return Briefcase;
    return iconMap[iconName.toLowerCase()] || Briefcase;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Header />
        <main className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading service...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Header />
        <main className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Service not found</h2>
            <p className="text-slate-600 mb-4">The service you're looking for doesn't exist.</p>
            <Button asChild className="bg-primary hover:bg-accent">
              <Link to="/services">Back to Services</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = getIcon(service.icon);

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        {/* Header Section */}
        <section className="border-b" style={{ backgroundColor: '#0F172A', borderColor: 'rgb(30 41 59)', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/services')}
              className="mb-6 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {service.title}
                </h1>
              </div>
              <p className="text-xl text-slate-300 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                {service.description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        {service.image_url && (
          <section className="border-b border-slate-200">
            <div className="container mx-auto px-4 lg:px-8 py-8">
              <img
                src={service.image_url}
                alt={service.title}
                className="w-full max-w-4xl mx-auto rounded-xl"
              />
            </div>
          </section>
        )}

        {/* Service Content */}
        {service.content && (
          <section className="py-12">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: service.content }}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Inquiry Form Section */}
        <section className="py-12 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Request a Consultation
                </h2>
                <p className="text-slate-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                {/* Existing Inquiry Alert */}
                {existingInquiry && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                          You have already submitted an inquiry for this service
                        </h3>
                        <p className="text-sm text-yellow-700 mb-2">
                          Status: <span className="font-medium capitalize">{existingInquiry.status.replace('_', ' ')}</span>
                        </p>
                        <p className="text-xs text-yellow-600">
                          Submitted on: {new Date(existingInquiry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelInquiry}
                        disabled={isCancelling}
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        {isCancelling ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Cancel Inquiry
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 border-slate-300"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 border-slate-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 border-slate-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="mt-1 border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="mt-1 border-slate-300"
                      required
                      disabled={!!existingInquiry}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !!existingInquiry}
                    className="w-full bg-primary hover:bg-accent"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : existingInquiry ? 'Inquiry Already Submitted' : 'Submit Inquiry'}
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
