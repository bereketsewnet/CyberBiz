import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CreditCard, TrendingUp, BarChart3, Settings, BookOpen, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/apiService';

const quickLinks = [
  { label: 'Pending Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Manage Jobs', href: '/admin/jobs', icon: Briefcase },
  { label: 'Manage Products', href: '/admin/products', icon: BookOpen },
  { label: 'Manage Users', href: '/admin/users', icon: Users },
  { label: 'Manage Ads', href: '/admin/ads', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    total_users: 0,
    total_users_change: '+0%',
    active_jobs: 0,
    active_jobs_change: '+0%',
    revenue_etb: 0,
    revenue_change: '+0%',
    conversion_rate: 0,
    conversion_rate_change: '+0%',
    pending_payments: 0,
    active_ads: 0,
    pending_password_resets: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getAdminStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.full_name}. Here's what's happening today.
            </p>
          </motion.div>

          {/* Stats Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6 h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-success">{stats.total_users_change}</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground mb-1">
                  {stats.total_users.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-success">{stats.active_jobs_change}</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground mb-1">
                  {stats.active_jobs}
                </p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-success">{stats.revenue_change}</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground mb-1">
                  {stats.revenue_etb.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Revenue (ETB)</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-success">{stats.conversion_rate_change}</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground mb-1">
                  {stats.conversion_rate}%
                </p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </motion.div>
            </div>
          )}

          {/* Password Reset Requests Alert */}
          {stats.pending_password_resets > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Password Reset Requests
                </h3>
                <p className="text-sm text-muted-foreground">
                  {stats.pending_password_resets} admin{stats.pending_password_resets > 1 ? 's' : ''} requested password reset. 
                  <Link to="/admin/users" className="text-primary hover:underline ml-1">
                    View and process
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-3 lg:grid-cols-3 gap-6"
          >
            {quickLinks.map((link, index) => (
              <Link
                key={link.label}
                to={link.href}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <link.icon className="w-6 h-6 text-primary" />
                  </div>
                  {index === 0 && stats.pending_payments > 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-full">
                      {stats.pending_payments} pending
                    </span>
                  )}
                  {index === 1 && stats.active_jobs > 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      {stats.active_jobs} active
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                  {link.label}
                </h3>
              </Link>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
