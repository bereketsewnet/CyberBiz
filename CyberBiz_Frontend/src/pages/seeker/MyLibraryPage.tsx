import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Play, Download, ShoppingBag } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/imageUtils';
import { apiService } from '@/services/apiService';
import type { Product } from '@/types';

export default function MyLibraryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const response = await apiService.getUserLibrary();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching library:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  // Navigate to product detail page where users can access/download resources
  const handleProductClick = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>My Library</h1>
            <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>Access your purchased courses and ebooks</p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Your library is empty</h2>
              <p className="text-slate-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Purchase courses or ebooks to start building your library</p>
              <Button asChild className="bg-primary hover:bg-accent transition-colors">
                <Link to="/courses"><ShoppingBag className="w-4 h-4 mr-2" />Browse Courses</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-xl border border-slate-200 overflow-hidden group shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
                  <div className="aspect-video bg-slate-100 relative">
                    {product.thumbnail_url ? <img src={getImageUrl(product.thumbnail_url)} alt={product.title} className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full flex items-center justify-center">
                        {product.type === 'COURSE' ? <Play className="w-12 h-12 text-slate-400" /> : <BookOpen className="w-12 h-12 text-slate-400" />}
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3" variant={product.type === 'COURSE' ? 'default' : 'secondary'}>{product.type}</Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{product.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>{product.description}</p>
                    <Button 
                      className="w-full bg-primary hover:bg-accent transition-colors"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.type === 'COURSE' ? (
                        <><Play className="w-4 h-4 mr-2" />Continue Learning</>
                      ) : product.is_downloadable ? (
                        <><Download className="w-4 h-4 mr-2" />Download</>
                      ) : (
                        <><BookOpen className="w-4 h-4 mr-2" />View Details</>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
