import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Code, Palette, BarChart3, Globe, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return Briefcase;
    return iconMap[iconName.toLowerCase()] || Briefcase;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        {/* Header Section */}
        <section className="border-b" style={{ backgroundColor: '#0F172A', borderColor: 'rgb(30 41 59)', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Our Services & Consulting
              </h1>
              <p className="text-slate-300 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                Professional services and consulting solutions to help your business grow
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No services available</h3>
                <p className="text-slate-600">Check back later for our services</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => {
                  const Icon = getIcon(service.icon);
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      {service.image_url && (
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      {!service.image_url && (
                        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
                          <Icon className="w-16 h-16 text-primary" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{service.title}</h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                      <Button asChild className="w-full bg-primary hover:bg-accent">
                        <Link to={`/services/${service.slug || service.id}`}>
                          Learn More <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

