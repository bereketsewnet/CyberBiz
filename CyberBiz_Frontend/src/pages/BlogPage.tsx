import { useState, useEffect } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { NativeAdDisplay } from '@/components/ads/NativeAdDisplay';
import type { Blog, BlogCategory } from '@/types';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [currentPage, searchQuery, selectedCategory]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getBlogs({
        page: currentPage,
        q: searchQuery || undefined,
        category_id: selectedCategory || undefined,
      });
      setBlogs(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getBlogCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
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
              <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Blog</h1>
              <p className="text-slate-300 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                Stay updated with the latest insights, tips, and news from CyberBiz Africa
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="border-b border-slate-200 bg-white py-6">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 border-slate-300"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentPage(1);
                  }}
                  className={selectedCategory === null ? 'bg-primary hover:bg-accent' : 'border-slate-300'}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentPage(1);
                    }}
                    className={selectedCategory === category.id ? 'bg-primary hover:bg-accent' : 'border-slate-300'}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No blog posts found</h3>
                <p className="text-slate-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog, index) => (
                    <React.Fragment key={blog.id}>
                      {/* Show ad every 3 posts (after 3rd, 6th, etc.) */}
                      {index > 0 && index % 3 === 0 && (
                        <div className="col-span-full my-6">
                          <NativeAdDisplay position="between_posts" limit={1} />
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {blog.featured_image_url && (
                          <img
                            src={blog.featured_image_url}
                            alt={blog.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-6">
                          {blog.category && (
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-3">
                              {blog.category.name}
                            </span>
                          )}
                          <h3 className="text-xl font-semibold text-slate-900 mb-2 line-clamp-2">{blog.title}</h3>
                          {blog.excerpt && (
                            <p className="text-slate-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                            {blog.author && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {blog.author.full_name}
                              </span>
                            )}
                            {blog.published_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(blog.published_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <Link to={`/blogs/${blog.id}`}>
                            <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50 hover:text-slate-900">
                              Read More <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

