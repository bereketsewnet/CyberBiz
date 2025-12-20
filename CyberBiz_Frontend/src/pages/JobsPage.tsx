import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header, Footer } from '@/components/layout';
import { JobCard } from '@/components/jobs/JobCard';
import { apiService } from '@/services/apiService';
import type { JobPosting } from '@/types';
import { AdDisplay } from '@/components/ads/AdDisplay';
import { useAdCheck } from '@/components/ads/useAdCheck';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { hasAds: hasSidebarAds } = useAdCheck('SIDEBAR');

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getJobs({
          q: searchParams.get('q') || undefined,
          page: currentPage,
        });
        setJobs(response.data);
        setTotalPages(response.meta.last_page);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [searchParams, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Search Header */}
        <section className="bg-card border-b border-border py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Browse Jobs
              </h1>
              <p className="text-muted-foreground mb-6">
                Find your next opportunity from top African companies
              </p>

              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search jobs by title, company, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <Button type="submit" size="lg" className="h-12 px-6 bg-gold-gradient hover:opacity-90">
                  Search
                </Button>
                <Button type="button" variant="outline" size="lg" className="h-12 px-6 hidden md:flex">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="py-10">
          <div className="container mx-auto px-4 lg:px-8">
            <div className={`grid ${hasSidebarAds ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-10`}>
              {/* Main Content */}
              <div className={hasSidebarAds ? 'lg:col-span-3' : ''}>
                {searchParams.get('q') && (
                  <p className="text-muted-foreground mb-6">
                    Showing results for "<span className="text-foreground font-medium">{searchParams.get('q')}</span>"
                  </p>
                )}

                {isLoading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-20">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      No jobs found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search or filters
                    </p>
                    <Button onClick={clearSearch} variant="outline">
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      {jobs.map((job, index) => (
                        <JobCard key={job.id} job={job} index={index} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-10 flex justify-center gap-2">
                        <Button
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center px-4 text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar with Ads */}
              {hasSidebarAds && (
                <div className="lg:col-span-1">
                  <AdDisplay position="SIDEBAR" />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
