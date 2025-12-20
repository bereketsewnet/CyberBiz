import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, BookOpen, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'ADMIN':
        return {
          title: 'Admin Dashboard',
          description: 'Manage the platform, users, and payments',
          actions: [
            { label: 'Admin Panel', href: '/admin', icon: Users },
            { label: 'Manage Payments', href: '/admin/payments', icon: Briefcase },
            { label: 'Browse Jobs', href: '/jobs', icon: Briefcase },
          ],
        };
      case 'SEEKER':
        return {
          title: 'Job Seeker Dashboard',
          description: 'Track your applications and find new opportunities',
          actions: [
            { label: 'Browse Jobs', href: '/jobs', icon: Briefcase },
            { label: 'My Applications', href: '/my-applications', icon: Users },
            { label: 'My Library', href: '/my-library', icon: BookOpen },
          ],
        };
      case 'EMPLOYER':
        return {
          title: 'Employer Dashboard',
          description: 'Manage your job postings and review applications',
          actions: [
            { label: 'My Jobs', href: '/my-jobs', icon: Briefcase },
            { label: 'Post New Job', href: '/my-jobs/create', icon: Users },
            { label: 'Browse Courses', href: '/courses', icon: BookOpen },
          ],
        };
      case 'LEARNER':
        return {
          title: 'Learner Dashboard',
          description: 'Access your courses and track progress',
          actions: [
            { label: 'My Library', href: '/my-library', icon: BookOpen },
            { label: 'Browse Courses', href: '/courses', icon: Briefcase },
            { label: 'Browse Jobs', href: '/jobs', icon: Users },
          ],
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to CyberBiz Africa',
          actions: [
            { label: 'Browse Jobs', href: '/jobs', icon: Briefcase },
            { label: 'Browse Courses', href: '/courses', icon: BookOpen },
          ],
        };
    }
  };

  const content = getRoleSpecificContent();

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
              {content.title}
            </h1>
            <p className="text-muted-foreground">{content.description}</p>
          </motion.div>

          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-hero-gradient rounded-2xl p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-secondary-foreground mb-2">
                  Welcome back, {user?.full_name?.split(' ')[0]}!
                </h2>
                <p className="text-secondary-foreground/70">
                  {user?.role === 'SEEKER' && "You're doing great! Keep applying to find your dream job."}
                  {user?.role === 'EMPLOYER' && "Ready to find your next star employee?"}
                  {user?.role === 'LEARNER' && "Continue learning and building your skills."}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center px-4 py-2 rounded-lg bg-secondary-foreground/10">
                  <p className="text-2xl font-bold text-primary">{user?.credits || 0}</p>
                  <p className="text-xs text-secondary-foreground/70">Credits</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.actions.map((action, index) => (
              <Link
                key={action.label}
                to={action.href}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all group card-hover"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <action.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {action.label}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  Go to {action.label.toLowerCase()}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
