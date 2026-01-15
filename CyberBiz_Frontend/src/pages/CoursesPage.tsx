import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, BookOpen, FileText } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService } from '@/services/apiService';
import type { Product } from '@/types';
import { NativeAdDisplay } from '@/components/ads/NativeAdDisplay';

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'COURSE' | 'EBOOK'>(
    (searchParams.get('type') as 'COURSE' | 'EBOOK') || 'all'
  );

  // Sync tab with URL params on mount
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'COURSE' || typeParam === 'EBOOK') {
      setActiveTab(typeParam);
    } else {
      setActiveTab('all');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: currentPage,
        };
        
        // Add search parameter
        const searchParam = searchParams.get('q');
        if (searchParam && searchParam.trim()) {
          params.q = searchParam.trim();
        }
        
        // Add type filter
        const typeParam = searchParams.get('type');
        if (typeParam === 'COURSE' || typeParam === 'EBOOK') {
          params.type = typeParam;
        }

        const response = await apiService.getProducts(params);
        setProducts(response.data);
        setTotalPages(response.meta.last_page);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const newParams = new URLSearchParams();
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery.trim());
    }
    // Keep current type filter
    const typeParam = searchParams.get('type');
    if (typeParam === 'COURSE' || typeParam === 'EBOOK') {
      newParams.set('type', typeParam);
    }
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    const newParams = new URLSearchParams();
    // Keep current type filter
    const typeParam = searchParams.get('type');
    if (typeParam === 'COURSE' || typeParam === 'EBOOK') {
      newParams.set('type', typeParam);
    }
    setSearchParams(newParams);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as typeof activeTab);
    setCurrentPage(1);
    const newParams = new URLSearchParams();
    if (value === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', value);
    }
    // Keep current search query
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery.trim());
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      
      <main className="flex-1">
        {/* Search Header */}
        <section className="py-6 sm:py-8 border-b" style={{ backgroundColor: '#0F172A', borderColor: 'rgb(30 41 59)', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 text-center sm:text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
                Level Up Your Skills
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mb-4 sm:mb-6 text-center sm:text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
                Access premium courses and ebooks designed for African professionals
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 w-full bg-white border-slate-300"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <Button type="submit" size="lg" className="h-12 px-4 sm:px-6 bg-primary hover:bg-accent transition-colors flex-1 sm:flex-none">
                  <Search className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Products */}
        <section className="py-6 sm:py-12 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6 sm:mb-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="COURSE" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Courses</span>
                </TabsTrigger>
                <TabsTrigger value="EBOOK" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">E-Books</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid lg:grid-cols-4 gap-6 lg:gap-10">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {searchParams.get('q') && (
                  <p className="text-slate-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Showing results for "<span className="text-slate-900 font-medium">{searchParams.get('q')}</span>"
                  </p>
                )}

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-20" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      No products found
                    </h3>
                    <p className="text-slate-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Try adjusting your search or filters
                    </p>
                    <Button onClick={clearSearch} variant="outline" className="border-slate-300 hover:bg-accent hover:text-white">
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {products.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Button
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                          className="w-full sm:w-auto border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-colors"
                        >
                          Previous
                        </Button>
                        <div className="flex items-center px-4 text-sm text-slate-600">
                          Page {currentPage} of {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                          className="w-full sm:w-auto border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-colors"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar with Native Ads - Desktop */}
              <div className="lg:col-span-1 hidden lg:block">
                <div className="sticky top-24">
                  <NativeAdDisplay position="sidebar" />
                </div>
              </div>
            </div>

            {/* Bottom Native Ads - Mobile & Tablet */}
            <div className="mt-8 lg:hidden">
              <NativeAdDisplay position="sidebar" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
