import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Trash2, FileText, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { Blog } from '@/types';

export default function AdminBlogsPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchQuery]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAdminBlogs({
        q: searchQuery || undefined,
        page: currentPage,
        // Don't pass status parameter - admin will see all blogs (drafts and published)
      });
      setBlogs(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (blogId: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await apiService.deleteBlog(blogId.toString());
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Manage Blog Posts</h1>
              <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>View, create, edit, and delete blog posts</p>
            </div>
            <Button asChild className="bg-primary hover:bg-accent transition-colors">
              <Link to="/admin/blogs/create"><Plus className="w-4 h-4 mr-2" />Create Blog Post</Link>
            </Button>
          </motion.div>

          <div className="mb-6">
            <div className="relative max-w-md">
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
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No blog posts found</h3>
              <p className="text-slate-600 mb-6">Get started by creating your first blog post</p>
              <Button asChild className="bg-primary hover:bg-accent transition-colors">
                <Link to="/admin/blogs/create"><Plus className="w-4 h-4 mr-2" />Create Blog Post</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {blog.featured_image_url && (
                        <img
                          src={blog.featured_image_url}
                          alt={blog.title}
                          className="w-full md:w-32 h-32 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">{blog.title}</h3>
                            {blog.excerpt && (
                              <p className="text-slate-600 text-sm mb-3 line-clamp-2">{blog.excerpt}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                              {blog.category && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {blog.category.name}
                                </span>
                              )}
                              {blog.author && (
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {blog.author.full_name}
                                </span>
                              )}
                              {blog.published_at && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(blog.published_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                            {blog.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/blogs/${blog.id}`)}
                            className="border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye className="w-4 h-4 mr-2" />View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/blogs/${blog.id}/edit`)}
                            className="border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Edit className="w-4 h-4 mr-2" />Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(blog.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
      </main>
      <Footer />
    </div>
  );
}

