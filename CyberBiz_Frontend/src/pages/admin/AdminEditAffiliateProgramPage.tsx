import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { AffiliateProgram } from '@/types';

export default function AdminEditAffiliateProgramPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<AffiliateProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    commission_rate: 0,
    target_url: '',
    is_active: true,
    cookie_duration: 30,
  });

  useEffect(() => {
    if (id) {
      fetchProgram();
    }
  }, [id]);

  const fetchProgram = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAdminAffiliatePrograms();
      const foundProgram = response.data.find(p => p.id.toString() === id);
      if (foundProgram) {
        setProgram(foundProgram);
        setFormData({
          name: foundProgram.name,
          description: foundProgram.description || '',
          type: foundProgram.type,
          commission_rate: foundProgram.commission_rate,
          target_url: foundProgram.target_url,
          is_active: foundProgram.is_active,
          cookie_duration: foundProgram.cookie_duration,
        });
      } else {
        toast.error('Affiliate program not found');
        navigate('/admin/affiliate/programs');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load affiliate program');
      navigate('/admin/affiliate/programs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target_url || formData.commission_rate <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await apiService.updateAffiliateProgram(id!, formData);
      toast.success('Affiliate program updated successfully!');
      navigate('/admin/affiliate/programs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update affiliate program');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Header />
        <main className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading affiliate program...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/affiliate/programs')}
              className="mb-6 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Button>

            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Edit Affiliate Program
            </h1>
            <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Update affiliate program details
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <Label htmlFor="name">Program Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Program name"
                    className="mt-1 border-slate-300"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Program description"
                    rows={3}
                    className="mt-1 border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Commission Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger className="mt-1 border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="commission_rate">
                      Commission Rate * ({formData.type === 'percentage' ? '%' : 'ETB'})
                    </Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      step={formData.type === 'percentage' ? '0.1' : '0.01'}
                      value={formData.commission_rate}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Preserve the exact value entered, parseFloat only for validation
                        if (inputValue === '' || inputValue === '.') {
                          setFormData({ ...formData, commission_rate: 0 });
                          return;
                        }
                        const value = parseFloat(inputValue);
                        if (!isNaN(value)) {
                          // Store the exact value - don't round in the input
                          setFormData({ ...formData, commission_rate: value });
                        }
                      }}
                      onBlur={(e) => {
                        // On blur, ensure value is properly formatted but preserve precision
                        const value = parseFloat(e.target.value) || 0;
                        // Only round for display/store - preserve what user entered
                        if (formData.type === 'percentage') {
                          // Round to 1 decimal place only when saving
                          setFormData({ ...formData, commission_rate: Math.round(value * 10) / 10 });
                        } else {
                          // For fixed, round to 2 decimals
                          setFormData({ ...formData, commission_rate: Math.round(value * 100) / 100 });
                        }
                      }}
                      className="mt-1 border-slate-300"
                      required
                      min="0"
                    />
                    {formData.type === 'percentage' && (
                      <p className="text-xs text-slate-500 mt-1">Enter as whole number or one decimal (e.g., 4 or 4.0)</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="target_url">Target URL *</Label>
                  <Input
                    id="target_url"
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    placeholder="https://example.com"
                    className="mt-1 border-slate-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cookie_duration">Cookie Duration (days)</Label>
                    <Input
                      id="cookie_duration"
                      type="number"
                      value={formData.cookie_duration}
                      onChange={(e) => setFormData({ ...formData, cookie_duration: parseInt(e.target.value) || 30 })}
                      className="mt-1 border-slate-300"
                      min="1"
                      max="365"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/affiliate/programs')}
                    className="border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-primary hover:bg-accent transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

