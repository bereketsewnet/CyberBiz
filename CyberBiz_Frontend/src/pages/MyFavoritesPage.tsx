import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { JobCard } from '@/components/jobs/JobCard';
import type { JobPosting } from '@/types';

interface FavoriteItem {
  id: string;
  job: JobPosting;
  created_at: string;
}

export default function MyFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await apiService.getMyFavorites();
        setFavorites(response.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Failed to load favorite jobs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const filteredFavorites = favorites.filter((item) =>
    item.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.job.employer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">My Saved Jobs</h1>
            <p className="text-muted-foreground">View and manage your favorited job postings</p>
          </motion.div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search saved jobs..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10" 
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredFavorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-card rounded-2xl border border-border"
            >
              <Bookmark className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                {searchQuery ? 'No matching jobs found' : 'No saved jobs yet'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Start bookmarking jobs you\'re interested in'}
              </p>
              {!searchQuery && (
                <Button asChild className="bg-gold-gradient hover:opacity-90 shadow-gold">
                  <Link to="/jobs">
                    Browse Jobs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredFavorites.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard job={item.job} index={index} />
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

