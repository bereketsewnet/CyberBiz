import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Search, ExternalLink } from 'lucide-react';
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
import type { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    impression_rate: 0,
    impression_unit: 0,
    click_rate: 0,
    click_unit: 0,
    target_url: '',
    is_active: true,
    cookie_duration: 30,
  });
  const [commissionRateInput, setCommissionRateInput] = useState<string>(''); // store raw text
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<'ALL' | 'COURSE' | 'EBOOK'>('ALL');

  useEffect(() => {
    if (id) {
      fetchProgram();
    }
  }, [id]);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const params: { type?: 'COURSE' | 'EBOOK'; q?: string; page?: number } = { page: 1 };
      if (productTypeFilter !== 'ALL') {
        params.type = productTypeFilter;
      }
      if (productSearch.trim()) {
        params.q = productSearch.trim();
      }
      const response = await apiService.getAdminProducts(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products for affiliate picker:', error);
      toast.error('Failed to load products. Please try again.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (showProductPicker) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProductPicker, productTypeFilter]);

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
          impression_rate: foundProgram.impression_rate || 0,
          impression_unit: foundProgram.impression_unit || 0,
          click_rate: foundProgram.click_rate || 0,
          click_unit: foundProgram.click_unit || 0,
          target_url: foundProgram.target_url,
          is_active: foundProgram.is_active,
          cookie_duration: foundProgram.cookie_duration,
        });
        setCommissionRateInput(String(foundProgram.commission_rate ?? ''));
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

    const parsedCommission = parseFloat(commissionRateInput.replace(',', '.'));

    if (!formData.name || !formData.target_url || isNaN(parsedCommission) || parsedCommission <= 0) {
      toast.error('Please fill in all required fields, enter a valid commission rate, and provide a target link');
      return;
    }

    const payload = {
      ...formData,
      commission_rate: parsedCommission,
    };

    setIsSaving(true);
    try {
      await apiService.updateAffiliateProgram(id!, payload);
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
                      type="text"
                      value={commissionRateInput}
                      onChange={(e) => setCommissionRateInput(e.target.value)}
                      className="mt-1 border-slate-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Impression Commission (optional)</Label>
                    <div className="grid grid-cols-[1.5fr,auto,1fr] items-center gap-2 mt-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.impression_rate || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            impression_rate: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="10"
                        className="border-slate-300"
                      />
                      <span className="text-xs text-slate-500">ETB per</span>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.impression_unit || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            impression_unit: e.target.value === '' ? 0 : parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="1000"
                        className="border-slate-300"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Example: 10 birr per 1000 impressions.
                    </p>
                  </div>

                  <div>
                    <Label>Click Commission (optional)</Label>
                    <div className="grid grid-cols-[1.5fr,auto,1fr] items-center gap-2 mt-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.click_rate || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            click_rate: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="10"
                        className="border-slate-300"
                      />
                      <span className="text-xs text-slate-500">ETB per</span>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.click_unit || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            click_unit: e.target.value === '' ? 0 : parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="300"
                        className="border-slate-300"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Example: 10 birr per 300 clicks.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_url">Target Link *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="target_url"
                      type="url"
                      value={formData.target_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_url: e.target.value,
                        })
                      }
                      placeholder="Paste a custom URL or use Select Product..."
                      className="mt-1 border-slate-300 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-1 border-slate-300 whitespace-nowrap"
                      onClick={() => setShowProductPicker(true)}
                    >
                      Select Product
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    You can paste any URL (e.g. Instagram, landing page) or pick a course / e‑book product.
                  </p>
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
      {/* Product picker dialog */}
      <Dialog open={showProductPicker} onOpenChange={setShowProductPicker}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Course or E‑Book</DialogTitle>
            <DialogDescription>
              Choose a product to promote. The affiliate link will redirect to the selected product page.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by title..."
                  className="pl-9 border-slate-300"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onBlur={() => loadProducts()}
                />
              </div>
              <Select
                value={productTypeFilter}
                onValueChange={(value) => setProductTypeFilter(value as 'ALL' | 'COURSE' | 'EBOOK')}
              >
                <SelectTrigger className="w-full md:w-48 border-slate-300">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="COURSE">Courses</SelectItem>
                  <SelectItem value="EBOOK">E‑Books</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg">
            {isLoadingProducts ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-md" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No products found. Try adjusting the filters.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {products.map((product) => {
                  const url = `${window.location.origin}/products/${product.id}`;
                  return (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, target_url: url }));
                        setShowProductPicker(false);
                      }}
                      className="w-full text-left p-3 hover:bg-slate-50 flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{product.title}</p>
                        <p className="text-xs text-slate-500">
                          {product.type} • ETB {Number(product.price_etb).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {url}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 mt-1" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
