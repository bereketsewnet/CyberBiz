import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Trash2, Search, User, Calendar, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { NewsletterSubscriber } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminNewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');

  // Add subscriber modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('');
  const [newSubscriberName, setNewSubscriberName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, statusFilter]);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getNewsletterSubscribers({
        page: currentPage,
        per_page: 15,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        q: searchQuery || undefined,
      });
      setSubscribers(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1);
        fetchSubscribers();
      } else {
        fetchSubscribers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddSubscriber = async () => {
    if (!newSubscriberEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSubscriberEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsAdding(true);
    try {
      await apiService.subscribeNewsletter({
        email: newSubscriberEmail.trim(),
        name: newSubscriberName.trim() || undefined,
      });
      toast.success('Subscriber added successfully');
      setAddModalOpen(false);
      setNewSubscriberEmail('');
      setNewSubscriberName('');
      fetchSubscribers();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('This email is already subscribed');
      } else {
        toast.error(error.message || 'Failed to add subscriber');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (subscriberId: number) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      await apiService.deleteNewsletterSubscriber(subscriberId.toString());
      toast.success('Subscriber deleted successfully');
      fetchSubscribers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subscriber');
    }
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
                  Newsletter Subscribers
                </h1>
                <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Manage newsletter subscribers
                </p>
              </div>
              <Button
                onClick={() => setAddModalOpen(true)}
                className="bg-primary hover:bg-accent transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subscriber
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  className={statusFilter === 'all' ? 'bg-primary hover:bg-accent' : 'border-slate-300'}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'subscribed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('subscribed')}
                  className={statusFilter === 'subscribed' ? 'bg-primary hover:bg-accent' : 'border-slate-300'}
                >
                  Subscribed
                </Button>
                <Button
                  variant={statusFilter === 'unsubscribed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('unsubscribed')}
                  className={statusFilter === 'unsubscribed' ? 'bg-primary hover:bg-accent' : 'border-slate-300'}
                >
                  Unsubscribed
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-lg p-4 h-20 animate-pulse" />
                ))}
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No subscribers found</h3>
                <p className="text-slate-600">No subscribers match your search criteria</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Subscribed
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-900">{subscriber.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {subscriber.name ? (
                                  <>
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-600">{subscriber.name}</span>
                                  </>
                                ) : (
                                  <span className="text-sm text-slate-400">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {subscriber.status === 'subscribed' ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Subscribed
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Unsubscribed
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" />
                                {new Date(subscriber.subscribed_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(subscriber.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

      {/* Add Subscriber Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
            <DialogDescription>
              Add a new email to the newsletter subscriber list
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="subscriber@example.com"
                value={newSubscriberEmail}
                onChange={(e) => setNewSubscriberEmail(e.target.value)}
                className="mt-1 border-slate-300"
              />
            </div>
            <div>
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Subscriber name"
                value={newSubscriberName}
                onChange={(e) => setNewSubscriberName(e.target.value)}
                className="mt-1 border-slate-300"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddModalOpen(false);
                setNewSubscriberEmail('');
                setNewSubscriberName('');
              }}
              disabled={isAdding}
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSubscriber}
              disabled={isAdding}
              className="bg-primary hover:bg-accent"
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscriber
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
