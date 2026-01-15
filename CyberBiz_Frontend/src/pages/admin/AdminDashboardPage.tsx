import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CreditCard, TrendingUp, BarChart3, Settings, BookOpen, Key, FileText, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/apiService';

const quickLinks = [
  { label: 'Pending Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Manage Jobs', href: '/admin/jobs', icon: Briefcase },
  { label: 'Manage Products', href: '/admin/products', icon: BookOpen },
  { label: 'Manage Blogs', href: '/admin/blogs', icon: FileText },
  { label: 'Newsletters', href: '/admin/newsletters', icon: Mail },
  { label: 'Services & Consulting', href: '/admin/services', icon: Briefcase },
  { label: 'Service Inquiries', href: '/admin/services/inquiries', icon: MessageSquare },
  { label: 'Native Ads', href: '/admin/native-ads', icon: TrendingUp },
  { label: 'Sponsorship Posts', href: '/admin/sponsorship-posts', icon: FileText },
  { label: 'Affiliate Programs', href: '/admin/affiliate/programs', icon: TrendingUp },
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
    visible_jobs: 0,
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
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Welcome back, {user?.full_name}. Here's what's happening today.
            </p>
          </motion.div>

          {/* Stats Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-xl border border-slate-200 p-6 h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stats.total_users_change}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stats.total_users.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>Total Users</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stats.active_jobs_change}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stats.active_jobs.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Published Jobs
                  {stats.visible_jobs !== undefined && stats.visible_jobs !== stats.active_jobs && (
                    <span className="ml-2 text-xs text-slate-500">
                      ({stats.visible_jobs} active)
                    </span>
                  )}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stats.revenue_change}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stats.revenue_etb.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>Revenue (ETB)</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stats.conversion_rate_change}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stats.conversion_rate}%
                </p>
                <p className="text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>Conversion Rate</p>
              </motion.div>
            </div>
          )}

          {/* Password Reset Requests Alert */}
          {stats.pending_password_resets > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Password Reset Requests
                </h3>
                <p className="text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stats.pending_password_resets} admin{stats.pending_password_resets > 1 ? 's' : ''} requested password reset. 
                  <Link to="/admin/users" className="text-primary hover:text-accent hover:underline ml-1 transition-colors">
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
            {quickLinks.map((link, index) => {
              const iconColors = [
                { bg: 'bg-red-50', text: 'text-red-600' },
                { bg: 'bg-blue-50', text: 'text-blue-600' },
                { bg: 'bg-orange-50', text: 'text-orange-600' },
                { bg: 'bg-purple-50', text: 'text-purple-600' },
                { bg: 'bg-green-50', text: 'text-green-600' },
                { bg: 'bg-slate-50', text: 'text-slate-600' },
              ];
              const colors = iconColors[index % iconColors.length];
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <link.icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    {index === 0 && stats.pending_payments > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        {stats.pending_payments} pending
                      </span>
                    )}
                    {index === 1 && stats.active_jobs > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {stats.active_jobs} published
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {link.label}
                  </h3>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
