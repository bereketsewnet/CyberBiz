import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Trash2, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header, Footer } from '@/components/layout';
import { getImageUrl } from '@/lib/imageUtils';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'COURSE' | 'EBOOK'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, activeTab]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAdminProducts({
        type: activeTab === 'all' ? undefined : activeTab,
        q: searchQuery || undefined,
        page: currentPage,
      });
      setProducts(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiService.deleteAdminProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Manage Products</h1>
              <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>View, create, edit, and delete courses and ebooks</p>
            </div>
            <Button asChild className="bg-primary hover:bg-accent transition-colors">
              <Link to="/admin/products/create"><Plus className="w-4 h-4 mr-2" />Create Product</Link>
            </Button>
          </motion.div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 border-slate-300"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setCurrentPage(1); }} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="COURSE" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="EBOOK" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                E-Books
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200" style={{ fontFamily: 'Inter, sans-serif' }}>
              <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>No products found</h3>
              <p className="text-slate-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>{searchQuery ? 'Try a different search term' : 'No products have been created yet'}</p>
              {!searchQuery && <Button asChild className="bg-primary hover:bg-accent transition-colors"><Link to="/admin/products/create"><Plus className="w-4 h-4 mr-2" />Create First Product</Link></Button>}
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-slate-100 relative">
                      {product.thumbnail_url ? (
                        <img src={getImageUrl(product.thumbnail_url)} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {product.type === 'COURSE' ? <BookOpen className="w-12 h-12 text-slate-400" /> : <FileText className="w-12 h-12 text-slate-400" />}
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3" variant={product.type === 'COURSE' ? 'default' : 'secondary'}>
                        {product.type}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>{product.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>{product.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold" style={{ color: '#F97316', fontFamily: 'Inter, sans-serif' }}>{formatPrice(product.price_etb)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1 border-slate-300">
                          <Link to={`/products/${product.id}`}><Eye className="w-4 h-4 mr-1" />View</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1 border-slate-300">
                          <Link to={`/admin/products/${product.id}/edit`}><Edit className="w-4 h-4 mr-1" />Edit</Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-colors">
                    Previous
                  </Button>
                  <div className="flex items-center px-4 text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-colors">
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

