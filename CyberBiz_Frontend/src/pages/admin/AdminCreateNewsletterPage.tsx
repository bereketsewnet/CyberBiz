import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, CheckSquare, Square, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function AdminCreateNewsletterPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Subscriber selection modal states
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [createdNewsletterId, setCreatedNewsletterId] = useState<number | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState<Set<number>>(new Set());
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState('');

  const handleSave = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSaving(true);
    try {
      await apiService.createNewsletter({
        subject: subject.trim(),
        content: content.trim(),
      });
      toast.success('Newsletter created successfully!');
      navigate('/admin/newsletters');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create newsletter');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSaving(true);
    try {
      // First create the newsletter
      const response = await apiService.createNewsletter({
        subject: subject.trim(),
        content: content.trim(),
      });
      
      // Open subscriber selection modal
      setCreatedNewsletterId(response.data.id);
      setSendModalOpen(true);
      setSelectedSubscriberIds(new Set());
      setSubscriberSearchQuery('');
      await fetchSubscribers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create newsletter');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
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
      setSelectedSubscriberIds(new Set());
    } else {
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
    if (!createdNewsletterId) return;

    const idsToSend = selectedSubscriberIds.size > 0 
      ? Array.from(selectedSubscriberIds)
      : undefined;

    setIsSending(true);
    try {
      const response = await apiService.sendNewsletter(
        createdNewsletterId.toString(),
        idsToSend
      );
      toast.success(`Newsletter created and sent to ${response.data.recipient_count} subscriber${response.data.recipient_count !== 1 ? 's' : ''}!`);
      setSendModalOpen(false);
      setCreatedNewsletterId(null);
      setSelectedSubscriberIds(new Set());
      navigate('/admin/newsletters');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send newsletter');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/newsletters')}
              className="mb-6 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Newsletters
            </Button>

            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Create Newsletter
            </h1>
            <p className="text-slate-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Create a new newsletter to send to subscribers
            </p>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Newsletter subject"
                  className="mt-1 border-slate-300"
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your newsletter content here. You can use HTML for formatting."
                  rows={15}
                  className="mt-1 border-slate-300 font-mono text-sm"
                />
                <p className="text-sm text-slate-500 mt-2">
                  You can use HTML tags for formatting (e.g., &lt;p&gt;, &lt;h1&gt;, &lt;a&gt;, etc.)
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/newsletters')}
                  className="border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || isSending}
                  variant="outline"
                  className="border-slate-300"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveAndSend}
                  disabled={isSaving || isSending}
                  className="bg-primary hover:bg-accent transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSaving ? 'Creating...' : 'Create & Send'}
                </Button>
              </div>
            </div>
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
                  <Send className="w-12 h-12 text-slate-300 mx-auto mb-4" />
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
              onClick={() => {
                setSendModalOpen(false);
                setCreatedNewsletterId(null);
                setSelectedSubscriberIds(new Set());
              }}
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
