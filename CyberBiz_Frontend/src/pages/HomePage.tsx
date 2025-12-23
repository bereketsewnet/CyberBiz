import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Briefcase, BookOpen, Users, ArrowRight, Sparkles, TrendingUp, Globe, FileText, Target, Building2, GraduationCap, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header, Footer } from '@/components/layout';
import { JobCard } from '@/components/jobs/JobCard';
import { ProductCard } from '@/components/products/ProductCard';
import { apiService } from '@/services/apiService';
import type { JobPosting, Product } from '@/types';
import { AdDisplay } from '@/components/ads/AdDisplay';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<JobPosting[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    active_jobs: 0,
    companies: 0,
    job_seekers: 0,
    success_rate: 85,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [heroImageError, setHeroImageError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, productsRes, statsRes] = await Promise.all([
          apiService.getJobs({ page: 1 }),
          apiService.getProducts({ page: 1 }),
          apiService.getStats(),
        ]);
        setFeaturedJobs(jobsRes.data.slice(0, 4));
        setFeaturedProducts(productsRes.data.slice(0, 3));
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
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
        <section className="relative bg-hero-gradient overflow-hidden">
          {/* Hero Image Background */}
          {!heroImageError && (
            <img
              src="/hero-image.jpg"
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setHeroImageError(true)}
            />
          )}
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
          
          {/* Pattern and decorative elements */}
          <div className="absolute inset-0 pattern-dots opacity-30" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-32 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white mb-6"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Welcome to CyberBiz Africa</span>
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
                  Solution Gateway
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
                <Button type="submit" size="lg" className="h-14 px-8 bg-primary hover:opacity-90 ">
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
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                  <Briefcase className="w-7 h-7 text-primary" />
                </div>
                <div className="font-display text-3xl font-bold text-foreground mb-1">
                  {stats.active_jobs}+
                </div>
                <div className="text-muted-foreground">Active Jobs</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                  <Globe className="w-7 h-7 text-primary" />
                </div>
                <div className="font-display text-3xl font-bold text-foreground mb-1">
                  {stats.companies}+
                </div>
                <div className="text-muted-foreground">Companies</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div className="font-display text-3xl font-bold text-foreground mb-1">
                  {stats.job_seekers}+
                </div>
                <div className="text-muted-foreground">Job Seekers</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <div className="font-display text-3xl font-bold text-foreground mb-1">
                  {stats.success_rate}%
                </div>
                <div className="text-muted-foreground">Success Rate</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Home Header Ad */}
        <section className="py-10">
          <div className="container mx-auto px-4 lg:px-8">
            <AdDisplay position="HOME_HEADER" />
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-10 gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Featured Jobs
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Latest opportunities from top African companies
                </p>
              </div>
              <Button asChild variant="outline" className="hidden sm:flex">
                <Link to="/jobs">
                  View All Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                {featuredJobs.map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))}
              </div>
            )}

            <div className="mt-6 sm:mt-8 text-center sm:hidden">
              <Button asChild>
                <Link to="/jobs">View All Jobs</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Boost Your Skills
                </h2>
                <p className="text-muted-foreground">
                  Courses and resources to advance your career
                </p>
              </div>
              <Button asChild variant="outline" className="hidden sm:flex">
                <Link to="/courses">
                  Browse All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Button asChild>
                <Link to="/courses">Browse All Courses</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Our Services Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Our Services
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive solutions for job seekers, employers, and professionals
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  Charity Job Board Ethiopia
                </h3>
                <p className="text-sm text-muted-foreground">
                  A specialized job board focusing solely on jobs within the nonprofit sectors including jobs within the local and international NGOs, the UN system as well as those from international aid and development agencies.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  Career Blogs
                </h3>
                <p className="text-sm text-muted-foreground">
                  A blog with state of the art career advice, knowledge, and skills whether for fresh graduates wanting to enter the job market or for veteran workers seeking to further develop, advance, or change their careers.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  CyberBizPromo
                </h3>
                <p className="text-sm text-muted-foreground">
                  A virtual digital solution to promote businesses and increase the profitability and marketability of organizations within nonprofit, private, or public sectors.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  Virtual Coach Africa
                </h3>
                <p className="text-sm text-muted-foreground">
                  An online coaching site on program lifecycle management as well as leadership skills.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Clients Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Our Clients
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <p className="text-lg text-muted-foreground text-center leading-relaxed">
                Include local and international NGOs, international humanitarian and development aid organizations, high school, college as well as university graduates looking for jobs and or wanting to advance their careers, local and international small and medium as well as large businesses operating in Ethiopia, project and or program managers as well as senior executives working in public, private as well as nonprofit sectors.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Get answers to common questions about our platform
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">
                      How can I access content of the site?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You can browse jobs and courses for free. Some premium content may require registration or purchase.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">
                      Is the job board free to access?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Yes, browsing and searching for jobs is completely free. You can view job listings and apply without any cost.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">
                      How can I access the cybercoach service?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Our virtual coaching services on program lifecycle management and leadership skills are available through our courses section. Browse our catalog to find relevant training programs.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="relative rounded-3xl bg-hero-gradient overflow-hidden">
              <div className="absolute inset-0 pattern-dots opacity-20" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              
              <div className="relative z-10 py-16 px-8 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left">
                  <h2 className="font-display text-3xl lg:text-4xl font-bold text-secondary-foreground mb-4">
                    Ready to Hire Top Talent?
                  </h2>
                  <p className="text-secondary-foreground/70 max-w-lg">
                    Post your job openings and reach thousands of qualified candidates across Africa.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-primary hover:opacity-90 text-white">
                    <Link to="/signup?role=EMPLOYER">Post a Job</Link>
                  </Button>
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 border-2 border-white">
                    <Link to="/signup?role=EMPLOYER">Register as Employer</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
