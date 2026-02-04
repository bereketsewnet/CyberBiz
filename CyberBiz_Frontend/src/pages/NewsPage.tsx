import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mail } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import type { Newsletter } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function NewsPage() {
  const [items, setItems] = useState<Newsletter[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Newsletter | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getPublicNewsletters({ page, per_page: 10 });
        setItems(response.data);
        setMeta(response.meta as PaginatedMeta);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [page]);

  const formatDate = (iso: string | undefined) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString();
  };

  const getPlainText = (html: string) => html.replace(/<[^>]*>/g, '').trim();

  const getExcerpt = (html: string, length = 220) => {
    const text = getPlainText(html);
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  };

  const handleOpenDetails = (item: Newsletter) => {
    setSelected(item);
    setOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              News & Updates
            </h1>
            <p className="text-slate-600 max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
              Read past newsletters and announcements from CyberBiz Africa. This page is read‑only and shows what has been sent to subscribers.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No news yet</h2>
              <p className="text-slate-600">Check back later for the latest updates and newsletters.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.subject}
                        </h2>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.created_at)}
                          {item.creator && (
                            <>
                              <span>•</span>
                              <span>by {item.creator.full_name}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {getExcerpt(item.content)}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      {item.sent_at && (
                        <div className="flex flex-col gap-1 text-[11px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Sent newsletter
                          </span>
                          <span>Sent on {formatDate(item.sent_at)}</span>
                          {item.recipient_count > 0 && (
                            <span>{item.recipient_count} subscribers</span>
                          )}
                        </div>
                      )}
                      {getPlainText(item.content).length > 220 && (
                        <Button
                          size="sm"
                          className="ml-auto bg-primary hover:bg-accent transition-colors"
                          onClick={() => handleOpenDetails(item)}
                        >
                          Read more
                        </Button>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>

              {meta && meta.last_page > 1 && (
                <div className="mt-10 flex justify-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-colors"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 text-sm text-slate-600">
                    Page {meta.current_page} of {meta.last_page}
                  </div>
                  <Button
                    variant="outline"
                    disabled={page === meta.last_page}
                    onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                    className="border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-colors"
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

      {/* Details Modal */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSelected(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
                <DialogDescription>
                  {formatDate(selected.created_at)}
                  {selected.creator && ` • by ${selected.creator.full_name}`}
                </DialogDescription>
              </DialogHeader>
              <div
                className="mt-4 prose prose-sm max-w-none text-slate-800"
                dangerouslySetInnerHTML={{ __html: selected.content }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
