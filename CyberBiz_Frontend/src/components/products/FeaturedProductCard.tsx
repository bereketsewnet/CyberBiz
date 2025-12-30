import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';
import type { Product } from '@/types';

interface FeaturedProductCardProps {
  product: Product;
  index?: number;
}

export function FeaturedProductCard({ product, index = 0 }: FeaturedProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        borderColor: 'rgb(241 245 249)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Inter, sans-serif'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'rgb(241 245 249)';
      }}
    >
      <div className="h-48 relative">
        {product.thumbnail_url ? (
          <img
            src={getImageUrl(product.thumbnail_url)}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <span className="text-slate-400">No Image</span>
          </div>
        )}
        <div
          className="absolute top-4 left-4 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-white uppercase tracking-wider"
          style={{
            backgroundColor: product.type === 'COURSE' ? 'rgba(37, 99, 235, 0.9)' : 'rgba(0, 0, 0, 0.6)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {product.type === 'COURSE' ? 'Course' : 'E-Book'}
        </div>
      </div>
      
      <div className="p-6 flex flex-col" style={{ height: 'calc(100% - 12rem)' }}>
        <h3 
          className="text-xl font-bold mb-2"
          style={{ color: '#0F172A', fontFamily: 'Inter, sans-serif' }}
        >
          {product.title}
        </h3>
        <p 
          className="text-sm mb-4 line-clamp-2"
          style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}
        >
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span 
            className="text-lg font-bold"
            style={{ color: '#F97316', fontFamily: 'Inter, sans-serif' }}
          >
            {product.is_free ? 'Free' : formatPrice(product.price_etb)}
          </span>
          <Link
            to={`/products/${product.id}`}
            className="text-sm flex items-center gap-1 transition-colors"
            style={{ color: '#0F172A', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#0F172A'}
          >
            Learn More <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

