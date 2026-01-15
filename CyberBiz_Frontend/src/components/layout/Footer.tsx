import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';
import { NativeAdDisplay } from '@/components/ads/NativeAdDisplay';

interface SiteSettings {
  address?: string;
  email?: string;
  phone?: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  youtube_url?: string;
}

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiService.getPublicSiteSettings();
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="py-12 border-t" style={{ backgroundColor: '#0F172A', color: '#CBD5E1', borderColor: 'rgb(30 41 59)', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Native Ads - Limit to 5 ads max to avoid cluttering */}
        <div className="mb-12">
          <NativeAdDisplay position="footer" limit={5} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img 
                src="/favicon.svg" 
                alt="CyberBiz Africa" 
                className="h-8 w-8 rounded-lg"
              />
              <span className="font-bold text-xl text-white tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Cyber<span style={{ color: '#F97316' }}>Biz</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Empowering African talent with opportunities and skills for the digital economy.
            </p>
            <div className="flex space-x-4">
              {settings.facebook_url && (
                <a 
                  href={settings.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgb(30 41 59)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F97316';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(30 41 59)';
                  }}
                >
                  <Facebook className="w-4 h-4 text-slate-300" />
                </a>
              )}
              {settings.twitter_url && (
                <a 
                  href={settings.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgb(30 41 59)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F97316';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(30 41 59)';
                  }}
                >
                  <Twitter className="w-4 h-4 text-slate-300" />
                </a>
              )}
              {settings.linkedin_url && (
                <a 
                  href={settings.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgb(30 41 59)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F97316';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(30 41 59)';
                  }}
                >
                  <Linkedin className="w-4 h-4 text-slate-300" />
                </a>
              )}
              {settings.instagram_url && (
                <a 
                  href={settings.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgb(30 41 59)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F97316';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(30 41 59)';
                  }}
                >
                  <Instagram className="w-4 h-4 text-slate-300" />
                </a>
              )}
              {settings.youtube_url && (
                <a 
                  href={settings.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgb(30 41 59)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F97316';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(30 41 59)';
                  }}
                >
                  <Youtube className="w-4 h-4 text-slate-300" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/jobs" className="hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                  Courses & Ebooks
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>For Employers</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/signup?role=EMPLOYER" className="hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/employer-faq" className="hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                  Employer FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Contact Us</h4>
            <ul className="space-y-3 text-sm">
              {settings.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="text-primary text-sm mt-1" style={{ color: '#F97316' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>{settings.address}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-3">
                  <Mail className="text-primary text-sm" style={{ color: '#F97316' }} />
                  <a 
                    href={`mailto:${settings.email}`} 
                    className="hover:text-primary transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="text-primary text-sm" style={{ color: '#F97316' }} />
                  <a 
                    href={`tel:${settings.phone.replace(/\s/g, '')}`} 
                    className="hover:text-primary transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {!settings.address && !settings.email && !settings.phone && !isLoading && (
                <li className="text-slate-500 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Contact information not available</li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Newsletter</h4>
            <NewsletterSignup variant="compact" className="flex-col" />
            <p className="text-xs text-slate-400 mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Stay updated with our latest news and offers
            </p>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-xs" style={{ borderColor: 'rgb(30 41 59)', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
          <p>© {new Date().getFullYear()} CyberBiz Africa. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <p className="text-slate-500 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              🧡 made by{' '}
              <a 
                href="https://wubsites.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 hover:underline transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                wubsites
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
