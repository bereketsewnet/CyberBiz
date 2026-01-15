import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { SponsorshipPost } from '@/types';

export default function AdminSponsorshipPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<SponsorshipPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPosts();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1);
        fetchPosts();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAdminSponsorshipPosts({
        page: currentPage,
        per_page: 15,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        q: searchQuery || undefined,
      });
      setPosts(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching sponsorship posts:', error);
      toast.error('Failed to load sponsorship posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this sponsorship post?')) return;

    try {
      await apiService.deleteSponsorshipPost(postId.toString());
      toast.success('Sponsorship post deleted successfully');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete sponsorship post');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      draft: { className: 'bg-slate-100 text-slate-800', label: 'Draft' },
      published: { className: 'bg-green-100 text-green-800', label: 'Published' },
      archived: { className: 'bg-gray-100 text-gray-800', label: 'Archived' },
    };

    const variant = variants[status] || variants.draft;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Sponsorship Posts
                </h1>
                <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Manage sponsored content posts
                </p>
              </div>
              <Button asChild className="bg-primary hover:bg-accent transition-colors">
                <Link to="/admin/sponsorship-posts/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sponsorship Post
                </Link>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search sponsorship posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 border-slate-300">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-lg p-6 h-32 animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No sponsorship posts found</h3>
                <p className="text-slate-600 mb-4">Get started by creating your first sponsorship post</p>
                <Button asChild className="bg-primary hover:bg-accent">
                  <Link to="/admin/sponsorship-posts/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Sponsorship Post
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-slate-900">{post.title}</h3>
                            {getStatusBadge(post.status)}
                            <Badge variant="outline">Priority: {post.priority}</Badge>
                          </div>
                          <p className="text-slate-600 mb-3">
                            <span className="font-medium">Sponsor:</span> {post.sponsor_name}
                          </p>
                          {post.excerpt && (
                            <p className="text-slate-600 mb-3 line-clamp-2">{post.excerpt}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            {post.published_at && (
                              <span>
                                Published: {new Date(post.published_at).toLocaleDateString()}
                              </span>
                            )}
                            {post.expires_at && (
                              <span>
                                Expires: {new Date(post.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/sponsorship-posts/${post.slug || post.id}`)}
                            className="border-slate-300"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/sponsorship-posts/${post.id}/edit`)}
                            className="border-slate-300"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(post.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

