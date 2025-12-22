import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, LogOut, Briefcase, BookOpen, LayoutDashboard, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'EMPLOYER':
        return '/my-jobs';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gold-gradient rounded-lg flex items-center justify-center shadow-gold">
              <span className="text-xl font-bold text-secondary">CB</span>
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              CyberBiz<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/jobs" className="text-muted-foreground hover:text-foreground transition-colors link-underline">
              Jobs
            </Link>
            <Link to="/courses" className="text-muted-foreground hover:text-foreground transition-colors link-underline">
              Courses
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors link-underline">
              About
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors link-underline">
              Contact
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{user.full_name.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                      {user.role}
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/payments')}>
                        <Briefcase className="w-4 h-4 mr-2" />
                        Manage Payments
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === 'EMPLOYER' && (
                    <DropdownMenuItem onClick={() => navigate('/my-jobs')}>
                      <Briefcase className="w-4 h-4 mr-2" />
                      My Jobs
                    </DropdownMenuItem>
                  )}
                  {user.role === 'SEEKER' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/my-applications')}>
                        <Briefcase className="w-4 h-4 mr-2" />
                        My Applications
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/my-library')}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        My Library
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === 'LEARNER' && (
                    <DropdownMenuItem onClick={() => navigate('/my-library')}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      My Library
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/my-favorites')}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved Jobs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/signup')} className="bg-gold-gradient hover:opacity-90 shadow-gold">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border"
            >
              <div className="py-4 space-y-4">
                <Link
                  to="/jobs"
                  className="block py-2 text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Jobs
                </Link>
                <Link
                  to="/courses"
                  className="block py-2 text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Courses
                </Link>
                <Link
                  to="/about"
                  className="block py-2 text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block py-2 text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="pt-4 border-t border-border space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          navigate(getDashboardLink());
                          setMobileMenuOpen(false);
                        }}
                      >
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-destructive"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          navigate('/login');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="w-full bg-gold-gradient"
                        onClick={() => {
                          navigate('/signup');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
