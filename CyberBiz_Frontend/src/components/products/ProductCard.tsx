import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const ProductIcon = product.type === 'COURSE' ? BookOpen : FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-card rounded-xl border border-border overflow-hidden card-hover"
    >
      <div className="aspect-video relative overflow-hidden">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ProductIcon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <Badge
          className="absolute top-3 left-3"
          variant={product.type === 'COURSE' ? 'default' : 'secondary'}
        >
          {product.type === 'COURSE' ? 'Course' : 'E-Book'}
        </Badge>
      </div>
      
      <div className="p-5">
        <h3 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          <Link to={`/products/${product.id}`}>{product.title}</Link>
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-xl text-primary">
            {formatPrice(product.price_etb)}
          </span>
          <Button asChild variant="ghost" size="sm" className="group/btn">
            <Link to={`/products/${product.id}`}>
              Learn More
              <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
