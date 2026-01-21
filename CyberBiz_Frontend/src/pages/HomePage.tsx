import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Briefcase, BookOpen, Users, ArrowRight, Sparkles, TrendingUp, Globe, FileText, Target, Building2, GraduationCap, HelpCircle, ChevronDown, DollarSign, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header, Footer } from '@/components/layout';
import { JobCard } from '@/components/jobs/JobCard';
import { FeaturedJobCard } from '@/components/jobs/FeaturedJobCard';
import { ProductCard } from '@/components/products/ProductCard';
import { FeaturedProductCard } from '@/components/products/FeaturedProductCard';
import { apiService } from '@/services/apiService';
import { getImageUrl } from '@/lib/imageUtils';
import type { JobPosting, Product, SponsorshipPost } from '@/types';
import { NativeAdDisplay } from '@/components/ads/NativeAdDisplay';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<JobPosting[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [sponsors, setSponsors] = useState<SponsorshipPost[]>([]);
  const [stats, setStats] = useState({
    active_jobs: 0,
    companies: 0,
    job_seekers: 0,
    success_rate: 85,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, productsRes, statsRes, sponsorsRes] = await Promise.all([
          apiService.getJobs({ page: 1 }),
          apiService.getProducts({ page: 1 }),
          apiService.getStats(),
          apiService.getSponsorshipPosts({ per_page: 10 }).catch(() => {
            return { data: [], meta: { total: 0 } };
          }),
        ]);
        
        setFeaturedJobs(jobsRes.data.slice(0, 4));
        setFeaturedProducts(productsRes.data.slice(0, 3));
        const sponsorsData = sponsorsRes.data || [];
        setSponsors(sponsorsData);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add CSS for hiding scrollbar in webkit browsers
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sponsor-scroll-container::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/jobs?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      // If empty, just navigate to jobs page
      navigate('/jobs');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden" style={{ backgroundColor: '#0F172A' }}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="/new-bg.jpg" 
              alt="Background" 
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-900/80" />
            {/* Subtle additional overlay for depth */}
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          {/* Add CSS animations (keeping for any future use) */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(30px, -30px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
            }
            @keyframes gridMove {
              0% { transform: translate(0, 0); }
              100% { transform: translate(50px, 50px); }
            }
          `}</style>
          
          <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-white mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Welcome to CyberBiz Africa</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 relative"
              >
                <span className="block">Your One-Stop Virtual</span>
                <motion.span
                  className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white border-2 border-white/30 shadow-xl relative z-10"
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Solution <span className="text-accent">Gateway</span>
                </motion.span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
              >
                CyberbizAfrica.com is a one-stop virtual solution gateway for job advertisement, career advice, business promotion, and online learning, and personal development.
              </motion.p>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Job title, keyword, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch(e);
                      }
                    }}
                    className="pl-12 h-14 bg-white/95 border-0 text-foreground placeholder:text-muted-foreground shadow-lg"
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8 bg-primary hover:bg-accent transition-colors">
                  Search Jobs
                </Button>
              </motion.form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/70"
              >
                <span>Popular:</span>
                {['Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer'].map((term) => (
                  <button
                    key={term}
                    onClick={() => navigate(`/jobs?q=${encodeURIComponent(term)}`)}
                    className="px-3 py-1 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors text-white"
                  >
                    {term}
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-card border-y border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="font-display text-3xl font-bold text-foreground mb-1">
                  {stats.active_jobs}+
                </div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group md:border-l border-border/50"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 mb-3 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="font-display text-3xl font-bold text-foreground mb-1">
                  {stats.companies}+
                </div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group md:border-l border-border/50"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="font-display text-3xl font-bold text-foreground mb-1">
                  {stats.job_seekers}+
                </div>
                <div className="text-sm text-muted-foreground">Job Seekers</div>
              </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group md:border-l border-border/50"
                >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="font-display text-3xl font-bold text-foreground mb-1">
                  {stats.success_rate}%
                  </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
                </motion.div>
            </div>
          </div>
        </section>

        {/* Content Inline Native Ad */}
        <section className="py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <NativeAdDisplay position="content_inline" limit={1} />
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="py-16 md:py-24 relative overflow-hidden" style={{ backgroundColor: '#0F172A' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Featured Jobs</h2>
                <p className="mt-2 text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>Latest opportunities from top African companies</p>
              </div>
              <Link 
                to="/jobs"
                className="hidden md:inline-flex items-center font-medium transition-colors"
                style={{ color: '#2563EB', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#60A5FA'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
              >
                View All Jobs <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: '#1E293B' }} />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {featuredJobs.slice(0, 3).map((job, index) => (
                  <FeaturedJobCard key={job.id} job={job} index={index} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link
                to="/jobs"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md transition-colors"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: '#EBF4FF',
                  color: '#2563EB'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DBEAFE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EBF4FF';
                }}
              >
                View All Jobs
              </Link>
            </div>
          </div>
        </section>

        {/* Between Sections Native Ad */}
        <section className="py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <NativeAdDisplay position="content_inline" limit={1} />
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24 relative overflow-hidden" style={{ backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold" style={{ color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
                  Boost Your Skills
                </h2>
                <p className="mt-2" style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                  Courses and resources to advance your career
                </p>
              </div>
              <Link
                to="/courses"
                className="hidden md:inline-flex items-center font-medium transition-colors"
                style={{ color: '#F97316', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FB923C'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#F97316'}
              >
                Browse All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 bg-white rounded-2xl animate-pulse border" style={{ borderColor: 'rgb(241 245 249)' }} />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {featuredProducts.map((product, index) => (
                  <FeaturedProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Sponsors Horizontal Scroll Section */}
        {sponsors.length > 0 && (
          <section className="py-12 bg-slate-50 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Our Sponsors
                </h2>
                <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Featured sponsorship partners
                </p>
              </div>
              
              <div className="overflow-x-auto pb-4 sponsor-scroll-container" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
                  {sponsors.map((sponsor, index) => (
                    <motion.div
                      key={sponsor.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => navigate(`/sponsorship-posts/${sponsor.slug || sponsor.id}`)}
                      className="flex-shrink-0 w-80 cursor-pointer group"
                    >
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                        {/* Show featured image on top */}
                        {sponsor.featured_image_url ? (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={getImageUrl(sponsor.featured_image_url)}
                              alt={sponsor.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-48 flex items-center justify-center bg-slate-100">
                            <p className="text-slate-400 text-sm">No featured image</p>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            {sponsor.sponsor_logo_url && (
                              <img
                                src={getImageUrl(sponsor.sponsor_logo_url)}
                                alt={sponsor.sponsor_name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {sponsor.sponsor_name}
                              </h3>
                            </div>
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {sponsor.title}
                          </h4>
                          {sponsor.excerpt && (
                            <p className="text-sm text-slate-600 line-clamp-3 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {sponsor.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-primary font-medium">
                            Read More
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Our Services Section */}
        <section className="py-16 md:py-24" style={{ backgroundColor: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Our Services
              </h2>
              <p className="mt-4 text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                Comprehensive solutions for job seekers, employers, and professionals
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="flex flex-col md:flex-row gap-6 p-8 rounded-2xl transition-colors group"
                style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid rgb(30 41 59)',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(30 41 59)';
                }}
              >
                <div className="shrink-0">
                  <div 
                    className="w-16 h-16 rounded-2xl bg-blue-900/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300"
                  >
                    <Briefcase className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Charity Job Board Ethiopia
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    A specialized job board focusing solely on jobs within the nonprofit sectors including jobs within the local and international NGOs, the UN system as well as those from international aid and development agencies.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col md:flex-row gap-6 p-8 rounded-2xl transition-colors group"
                style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid rgb(30 41 59)',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F97316';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(30 41 59)';
                }}
              >
                <div className="shrink-0">
                  <div 
                    className="w-16 h-16 rounded-2xl bg-orange-900/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform duration-300"
                  >
                    <FileText className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Career Blogs
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    A blog with state of the art career advice, knowledge, and skills whether for fresh graduates wanting to enter the job market or for veteran workers seeking to further develop, advance, or change their careers.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-6 p-8 rounded-2xl transition-colors group"
                style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid rgb(30 41 59)',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F97316';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(30 41 59)';
                }}
              >
                <div className="shrink-0">
                  <div 
                    className="w-16 h-16 rounded-2xl bg-purple-900/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300"
                  >
                    <Target className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    CyberBizPromo
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    A virtual digital solution to promote businesses and increase the profitability and marketability of organizations within nonprofit, private, or public sectors.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col md:flex-row gap-6 p-8 rounded-2xl transition-colors group"
                style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid rgb(30 41 59)',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(30 41 59)';
                }}
              >
                <div className="shrink-0">
                  <div 
                    className="w-16 h-16 rounded-2xl bg-green-900/30 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform duration-300"
                  >
                    <GraduationCap className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Virtual Coach Africa
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    An online coaching site on program lifecycle management as well as leadership skills.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Clients Section */}
        <section className="py-16 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-8" style={{ color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
              Our Clients
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Include local and international NGOs, international humanitarian and development aid organizations, high school, college as well as university graduates looking for jobs and or wanting to advance their careers, local and international small and medium as well as large businesses operating in Ethiopia, project and or program managers as well as senior executives working in public, private as well as nonprofit sectors.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24" style={{ backgroundColor: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                Get answers to common questions about our platform
              </p>
            </div>
            <div className="space-y-4">
              <div 
                className="border rounded-xl overflow-hidden transition-colors"
                style={{
                  borderColor: 'rgb(51 65 85)',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <details className="group p-6 cursor-pointer" style={{ backgroundColor: '#1E293B' }}>
                  <summary className="flex items-center justify-between font-medium text-white list-none">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="text-secondary" style={{ color: '#2563EB' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>How can I access content of the site?</span>
                    </div>
                    <ChevronDown className="transition-transform group-open:rotate-180 text-slate-400" />
                  </summary>
                  <p className="text-slate-400 mt-4 ml-9 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    You can browse jobs and courses for free. Some premium content may require registration or purchase.
                  </p>
                </details>
              </div>

              <div 
                className="border rounded-xl overflow-hidden transition-colors"
                style={{
                  borderColor: 'rgb(51 65 85)',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <details className="group p-6 cursor-pointer" style={{ backgroundColor: '#1E293B' }}>
                  <summary className="flex items-center justify-between font-medium text-white list-none">
                    <div className="flex items-center gap-3">
                      <DollarSign className="text-secondary" style={{ color: '#2563EB' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>Is the job board free to access?</span>
                    </div>
                    <ChevronDown className="transition-transform group-open:rotate-180 text-slate-400" />
                  </summary>
                  <p className="text-slate-400 mt-4 ml-9 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Yes, browsing and searching for jobs is completely free. You can view job listings and apply without any cost.
                  </p>
                </details>
              </div>

              <div 
                className="border rounded-xl overflow-hidden transition-colors"
                style={{
                  borderColor: 'rgb(51 65 85)',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <details className="group p-6 cursor-pointer" style={{ backgroundColor: '#1E293B' }}>
                  <summary className="flex items-center justify-between font-medium text-white list-none">
                    <div className="flex items-center gap-3">
                      <School className="text-secondary" style={{ color: '#2563EB' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>How can I access the cybercoach service?</span>
                    </div>
                    <ChevronDown className="transition-transform group-open:rotate-180 text-slate-400" />
                  </summary>
                  <p className="text-slate-400 mt-4 ml-9 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Our virtual coaching services on program lifecycle management and leadership skills are available through our courses section. Browse our catalog to find relevant training programs.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 pb-16">
          <div className="rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden" style={{ 
            background: 'linear-gradient(to right, #0F172A, #1e3a8a)',
            fontFamily: 'Inter, sans-serif'
          }}>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)' }}></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)' }}></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Ready to Hire Top Talent?
                  </h2>
                <p className="text-blue-100 max-w-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Post your job openings and reach thousands of qualified candidates across Africa.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup?role=EMPLOYER"
                  className="px-6 py-3 border rounded-lg font-medium transition-colors"
                  style={{
                    borderColor: '#60A5FA',
                    color: '#DBEAFE',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#DBEAFE';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Post a Job
                </Link>
                <Link
                  to="/signup?role=EMPLOYER"
                  className="px-6 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#2563EB',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  Register as Employer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
