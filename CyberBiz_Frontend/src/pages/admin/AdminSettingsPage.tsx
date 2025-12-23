import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

interface SiteSettings {
  id: number;
  address?: string;
  email?: string;
  phone?: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  youtube_url?: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    id: 0,
    address: '',
    email: '',
    phone: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    instagram_url: '',
    youtube_url: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getSiteSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Helper function to convert empty strings to null
      const nullIfEmpty = (value: string | undefined) => {
        return value && value.trim() !== '' ? value.trim() : null;
      };

      const response = await apiService.updateSiteSettings({
        address: nullIfEmpty(settings.address),
        email: nullIfEmpty(settings.email),
        phone: nullIfEmpty(settings.phone),
        facebook_url: nullIfEmpty(settings.facebook_url),
        twitter_url: nullIfEmpty(settings.twitter_url),
        linkedin_url: nullIfEmpty(settings.linkedin_url),
        instagram_url: nullIfEmpty(settings.instagram_url),
        youtube_url: nullIfEmpty(settings.youtube_url),
      });

      setSettings(response.data);
      toast.success('Settings updated successfully');
    } catch (error: any) {
      console.error('Error updating settings:', error);
      // Show more detailed error message if validation errors exist
      if (error.errors) {
        // Format validation errors nicely
        const errorMessages: string[] = [];
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errorMessages.push(...messages);
          } else if (typeof messages === 'string') {
            errorMessages.push(messages);
          }
        });
        toast.error(errorMessages.length > 0 ? errorMessages.join(', ') : 'Validation failed');
      } else {
        toast.error(error.message || 'Failed to update settings');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Site Settings</h1>
                <p className="text-muted-foreground">Manage website contact information and social media links</p>
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                {/* Contact Information Section */}
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </Label>
                      <Textarea
                        id="address"
                        value={settings.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Enter full address..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="contact@example.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={settings.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+251 XXX XXX XXX"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Section */}
                <div className="border-t border-border pt-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Facebook className="w-5 h-5 text-primary" />
                    Social Media Links
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="facebook_url" className="flex items-center gap-2">
                        <Facebook className="w-4 h-4" />
                        Facebook URL
                      </Label>
                      <Input
                        id="facebook_url"
                        type="url"
                        value={settings.facebook_url || ''}
                        onChange={(e) => handleChange('facebook_url', e.target.value)}
                        placeholder="https://www.facebook.com/yourpage"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="twitter_url" className="flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        Twitter URL
                      </Label>
                      <Input
                        id="twitter_url"
                        type="url"
                        value={settings.twitter_url || ''}
                        onChange={(e) => handleChange('twitter_url', e.target.value)}
                        placeholder="https://twitter.com/yourhandle"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn URL
                      </Label>
                      <Input
                        id="linkedin_url"
                        type="url"
                        value={settings.linkedin_url || ''}
                        onChange={(e) => handleChange('linkedin_url', e.target.value)}
                        placeholder="https://www.linkedin.com/company/yourcompany"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instagram_url" className="flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        Instagram URL
                      </Label>
                      <Input
                        id="instagram_url"
                        type="url"
                        value={settings.instagram_url || ''}
                        onChange={(e) => handleChange('instagram_url', e.target.value)}
                        placeholder="https://www.instagram.com/yourhandle"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="youtube_url" className="flex items-center gap-2">
                        <Youtube className="w-4 h-4" />
                        YouTube URL
                      </Label>
                      <Input
                        id="youtube_url"
                        type="url"
                        value={settings.youtube_url || ''}
                        onChange={(e) => handleChange('youtube_url', e.target.value)}
                        placeholder="https://www.youtube.com/channel/yourchannel"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t border-border pt-6 flex justify-end">
                  <Button type="submit" size="lg" disabled={isSaving} className="bg-primary hover:opacity-90">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

