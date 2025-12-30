import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, MapPin, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
  const [showFilters, setShowFilters] = useState(false);
  const { hasAds: hasSidebarAds } = useAdCheck('SIDEBAR');

  // Filter states
  const [jobType, setJobType] = useState<string>(searchParams.get('job_type') || '');
  const [location, setLocation] = useState<string>(searchParams.get('location') || '');
  const [experience, setExperience] = useState<string>(searchParams.get('experience') || '');

  // Sync filter states with URL params on mount
  useEffect(() => {
    setJobType(searchParams.get('job_type') || '');
    setLocation(searchParams.get('location') || '');
    setExperience(searchParams.get('experience') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          q: searchParams.get('q') || undefined,
          page: currentPage,
        };
        
        // Add filter parameters
        if (searchParams.get('job_type')) params.job_type = searchParams.get('job_type');
        if (searchParams.get('location')) params.location = searchParams.get('location');
        if (searchParams.get('experience')) params.experience = searchParams.get('experience');

        const response = await apiService.getJobs(params);
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

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setJobType('');
    setLocation('');
    setExperience('');
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    setSearchParams(newParams);
  };

  const applyFilters = () => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    if (jobType) newParams.set('job_type', jobType);
    if (location) newParams.set('location', location);
    if (experience) newParams.set('experience', experience);
    setSearchParams(newParams);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const activeFiltersCount = [jobType, location, experience].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      
      <main className="flex-1">
        {/* Search Header */}
        <section className="py-6 sm:py-8 border-b" style={{ backgroundColor: '#0F172A', borderColor: 'rgb(30 41 59)', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Browse Jobs
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mb-4 sm:mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Find your next opportunity from top African companies
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search jobs by title, company, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 w-full bg-white border-slate-300"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button type="submit" size="lg" className="h-12 px-4 sm:px-6 bg-primary hover:bg-accent transition-colors flex-1 sm:flex-none">
                    <Search className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Search</span>
                  </Button>
                  <Sheet open={showFilters} onOpenChange={setShowFilters}>
                    <SheetTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="lg" 
                        className="h-12 px-4 sm:px-6 relative"
                        style={{
                          borderColor: 'rgb(100 116 139)',
                          color: '#ffffff',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgb(30 41 59)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Filter className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFiltersCount > 0 && (
                          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <SheetHeader>
                        <SheetTitle style={{ fontFamily: 'Inter, sans-serif' }}>Filter Jobs</SheetTitle>
                        <SheetDescription style={{ fontFamily: 'Inter, sans-serif' }}>
                          Refine your job search by selecting filters below
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        {/* Job Type Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Job Type
                          </Label>
                          <Select value={jobType || undefined} onValueChange={(value) => setJobType(value === 'all' ? '' : value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Job Types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Job Types</SelectItem>
                              <SelectItem value="FULL_TIME">Full Time</SelectItem>
                              <SelectItem value="PART_TIME">Part Time</SelectItem>
                              <SelectItem value="CONTRACT">Contract</SelectItem>
                              <SelectItem value="INTERNSHIP">Internship</SelectItem>
                              <SelectItem value="FREELANCE">Freelance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Location Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Location
                          </Label>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="Enter location (e.g. Addis Ababa, Remote)"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              className="w-full pr-8"
                            />
                            {location && (
                              <button
                                type="button"
                                onClick={() => setLocation('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Experience Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Experience Level
                          </Label>
                          <Select value={experience || undefined} onValueChange={(value) => setExperience(value === 'all' ? '' : value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Experience Levels" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Experience Levels</SelectItem>
                              <SelectItem value="Entry">Entry Level</SelectItem>
                              <SelectItem value="Mid">Mid Level</SelectItem>
                              <SelectItem value="Senior">Senior Level</SelectItem>
                              <SelectItem value="Executive">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          <Button
                            onClick={applyFilters}
                            className="flex-1 bg-primary hover:bg-accent transition-colors"
                          >
                            Apply Filters
                          </Button>
                          <Button
                            onClick={clearFilters}
                            variant="outline"
                            className="flex-1"
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="py-6 sm:py-10 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <div className={`grid ${hasSidebarAds ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-6 lg:gap-10`}>
              {/* Main Content */}
              <div className={hasSidebarAds ? 'lg:col-span-3' : 'w-full'}>
                {searchParams.get('q') && (
                  <p className="text-slate-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Showing results for "<span className="text-slate-900 font-medium">{searchParams.get('q')}</span>"
                  </p>
                )}

                {/* Active Filters Display */}
                {(jobType || location || experience) && (
                  <div className="flex flex-wrap items-center gap-2 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="text-sm text-slate-600">Active filters:</span>
                    {jobType && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setJobType('');
                          handleFilterChange('job_type', '');
                        }}
                        className="h-7 text-xs"
                      >
                        {jobType.replace('_', ' ')}
                        <X className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                    {location && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setLocation('');
                          handleFilterChange('location', '');
                        }}
                        className="h-7 text-xs"
                      >
                        {location}
                        <X className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                    {experience && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setExperience('');
                          handleFilterChange('experience', '');
                        }}
                        className="h-7 text-xs"
                      >
                        {experience}
                        <X className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Clear all
                    </Button>
                  </div>
                )}

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-20" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      No jobs found
                    </h3>
                    <p className="text-slate-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Try adjusting your search or filters
                    </p>
                    <Button onClick={clearSearch} variant="outline" className="hover:bg-accent hover:text-white border-slate-300">
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                      {jobs.map((job, index) => (
                        <JobCard key={job.id} job={job} index={index} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Button
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                          className="w-full sm:w-auto border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-colors"
                        >
                          Previous
                        </Button>
                        <div className="flex items-center px-4 text-sm text-slate-600">
                          Page {currentPage} of {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                          className="w-full sm:w-auto border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-colors"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar with Ads - Desktop */}
              {hasSidebarAds && (
                <div className="lg:col-span-1 hidden lg:block">
                  <div className="sticky top-24">
                    <AdDisplay position="SIDEBAR" />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Ads - Mobile & Tablet */}
            {hasSidebarAds && (
              <div className="mt-8 lg:hidden">
                <AdDisplay position="SIDEBAR" />
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
