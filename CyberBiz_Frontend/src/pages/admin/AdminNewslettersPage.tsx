import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Mail, Send, Trash2, Calendar, User, Search, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { Newsletter, NewsletterSubscriber } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminNewslettersPage() {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscriber selection modal states
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<number | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState<Set<number>>(new Set());
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchNewsletters();
  }, [currentPage]);

  const fetchNewsletters = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getNewsletters({
        page: currentPage,
        per_page: 15,
      });
      setNewsletters(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      toast.error('Failed to load newsletters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendClick = async (newsletterId: number) => {
    // Check if newsletter is already sent
    const newsletter = newsletters.find(n => n.id === newsletterId);
    if (newsletter?.sent_at) {
      toast.error('This newsletter has already been sent');
      return;
    }

    setSelectedNewsletterId(newsletterId);
    setSendModalOpen(true);
    setSelectedSubscriberIds(new Set());
    setSubscriberSearchQuery('');
    await fetchSubscribers();
  };

  const fetchSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
      // Fetch all subscribed subscribers (use a large per_page to get all)
      const response = await apiService.getNewsletterSubscribers({
        status: 'subscribed',
        per_page: 1000,
      });
      setSubscribers(response.data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  const handleSelectAll = () => {
    const filteredSubscribers = getFilteredSubscribers();
    if (selectedSubscriberIds.size === filteredSubscribers.length) {
      // Deselect all
      setSelectedSubscriberIds(new Set());
    } else {
      // Select all filtered
      setSelectedSubscriberIds(new Set(filteredSubscribers.map(s => s.id)));
    }
  };

  const handleSubscriberToggle = (subscriberId: number) => {
    const newSelected = new Set(selectedSubscriberIds);
    if (newSelected.has(subscriberId)) {
      newSelected.delete(subscriberId);
    } else {
      newSelected.add(subscriberId);
    }
    setSelectedSubscriberIds(newSelected);
  };

  const getFilteredSubscribers = () => {
    if (!subscriberSearchQuery.trim()) {
      return subscribers;
    }
    const query = subscriberSearchQuery.toLowerCase();
    return subscribers.filter(
      s => s.email.toLowerCase().includes(query) || 
      (s.name && s.name.toLowerCase().includes(query))
    );
  };

  const filteredSubscribers = getFilteredSubscribers();
  const allFilteredSelected = filteredSubscribers.length > 0 && 
    filteredSubscribers.every(s => selectedSubscriberIds.has(s.id));

  const handleSend = async () => {
    if (!selectedNewsletterId) return;

    const idsToSend = selectedSubscriberIds.size > 0 
      ? Array.from(selectedSubscriberIds)
      : undefined; // If none selected, send to all

    setIsSending(true);
    try {
      const response = await apiService.sendNewsletter(
        selectedNewsletterId.toString(),
        idsToSend
      );
      toast.success(`Newsletter sent to ${response.data.recipient_count} subscriber${response.data.recipient_count !== 1 ? 's' : ''}!`);
      setSendModalOpen(false);
      setSelectedNewsletterId(null);
      setSelectedSubscriberIds(new Set());
      fetchNewsletters();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send newsletter');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (newsletterId: number) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) return;

    try {
      await apiService.deleteNewsletter(newsletterId.toString());
      toast.success('Newsletter deleted successfully');
      fetchNewsletters();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete newsletter');
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
                  Newsletter Management
                </h1>
                <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Create and send newsletters to subscribers
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="border-slate-300 hover:bg-slate-50 hover:text-slate-900">
                  <Link to="/admin/newsletters/subscribers">
                    <Mail className="w-4 h-4 mr-2" />
                    Manage Subscribers
                  </Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-accent transition-colors">
                  <Link to="/admin/newsletters/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Newsletter
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search newsletters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-lg p-6 h-32 animate-pulse" />
                ))}
              </div>
            ) : newsletters.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No newsletters found</h3>
                <p className="text-slate-600 mb-4">Get started by creating your first newsletter</p>
                <Button asChild className="bg-primary hover:bg-accent">
                  <Link to="/admin/newsletters/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Newsletter
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {newsletters
                    .filter((newsletter) =>
                      searchQuery
                        ? newsletter.subject.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((newsletter) => (
                      <motion.div
                        key={newsletter.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-slate-900">{newsletter.subject}</h3>
                              {newsletter.sent_at ? (
                                <Badge className="bg-green-100 text-green-800">Sent</Badge>
                              ) : (
                                <Badge variant="secondary">Draft</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                              {newsletter.creator && (
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {newsletter.creator.full_name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(newsletter.created_at).toLocaleDateString()}
                              </span>
                              {newsletter.sent_at && (
                                <span className="flex items-center gap-1">
                                  <Send className="w-4 h-4" />
                                  Sent to {newsletter.recipient_count} subscribers
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: newsletter.content.substring(0, 200) }} />
                          </div>
                          <div className="flex flex-col gap-2">
                            {!newsletter.sent_at && (
                              <Button
                                size="sm"
                                onClick={() => handleSendClick(newsletter.id)}
                                className="bg-primary hover:bg-accent"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Send
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(newsletter.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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

      {/* Send Newsletter Modal */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Subscribers</DialogTitle>
            <DialogDescription>
              Choose which subscribers to send this newsletter to. Leave all unchecked to send to all subscribers.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search subscribers by email or name..."
                value={subscriberSearchQuery}
                onChange={(e) => setSubscriberSearchQuery(e.target.value)}
                className="pl-9 border-slate-300"
              />
            </div>

            {/* Select All */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-slate-300 hover:bg-slate-50"
              >
                {allFilteredSelected ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
              <span className="text-sm text-slate-600">
                {selectedSubscriberIds.size > 0 
                  ? `${selectedSubscriberIds.size} selected`
                  : 'Send to all subscribers if none selected'
                }
              </span>
            </div>

            {/* Subscribers List */}
            <div className="flex-1 overflow-y-auto border rounded-lg">
              {isLoadingSubscribers ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading subscribers...</p>
                </div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No subscribers found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredSubscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedSubscriberIds.has(subscriber.id)}
                        onCheckedChange={() => handleSubscriberToggle(subscriber.id)}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {subscriber.email}
                        </p>
                        {subscriber.name && (
                          <p className="text-xs text-slate-500 truncate">{subscriber.name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSendModalOpen(false)}
              disabled={isSending}
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="bg-primary hover:bg-accent"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Newsletter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
