import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import CoursesPage from "./pages/CoursesPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import SponsorshipPostDetailPage from "./pages/SponsorshipPostDetailPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

// Seeker Pages
import MyApplicationsPage from "./pages/seeker/MyApplicationsPage";
import MyLibraryPage from "./pages/seeker/MyLibraryPage";
import MyFavoritesPage from "./pages/MyFavoritesPage";

// Employer Pages
import MyJobsPage from "./pages/employer/MyJobsPage";
import CreateJobPage from "./pages/employer/CreateJobPage";
import EditJobPage from "./pages/employer/EditJobPage";
import JobApplicationsPage from "./pages/employer/JobApplicationsPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminJobsPage from "./pages/admin/AdminJobsPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCreateProductPage from "./pages/admin/AdminCreateProductPage";
import AdminEditProductPage from "./pages/admin/AdminEditProductPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminUserDetailPage from "./pages/admin/AdminUserDetailPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminBlogsPage from "./pages/admin/AdminBlogsPage";
import AdminCreateBlogPage from "./pages/admin/AdminCreateBlogPage";
import AdminEditBlogPage from "./pages/admin/AdminEditBlogPage";
import AdminNewslettersPage from "./pages/admin/AdminNewslettersPage";
import AdminCreateNewsletterPage from "./pages/admin/AdminCreateNewsletterPage";
import AdminNewsletterSubscribersPage from "./pages/admin/AdminNewsletterSubscribersPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminCreateServicePage from "./pages/admin/AdminCreateServicePage";
import AdminEditServicePage from "./pages/admin/AdminEditServicePage";
import AdminServiceInquiriesPage from "./pages/admin/AdminServiceInquiriesPage";
import AdminNativeAdsPage from "./pages/admin/AdminNativeAdsPage";
import AdminCreateNativeAdPage from "./pages/admin/AdminCreateNativeAdPage";
import AdminEditNativeAdPage from "./pages/admin/AdminEditNativeAdPage";
import AdminSponsorshipPostsPage from "./pages/admin/AdminSponsorshipPostsPage";
import AdminCreateSponsorshipPostPage from "./pages/admin/AdminCreateSponsorshipPostPage";
import AdminEditSponsorshipPostPage from "./pages/admin/AdminEditSponsorshipPostPage";
import AdminAffiliateProgramsPage from "./pages/admin/AdminAffiliateProgramsPage";
import AdminCreateAffiliateProgramPage from "./pages/admin/AdminCreateAffiliateProgramPage";
import AffiliateDashboardPage from "./pages/AffiliateDashboardPage";

// Components
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/sponsorship-posts/:id" element={<SponsorshipPostDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:idOrSlug" element={<ServiceDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected Routes - Any authenticated user */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-favorites"
            element={
              <ProtectedRoute>
                <MyFavoritesPage />
              </ProtectedRoute>
            }
          />

          {/* Seeker Routes */}
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute allowedRoles={['SEEKER', 'LEARNER']}>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-library"
            element={
              <ProtectedRoute allowedRoles={['SEEKER', 'LEARNER']}>
                <MyLibraryPage />
              </ProtectedRoute>
            }
          />

          {/* Employer Routes */}
          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute role="EMPLOYER">
                <MyJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-jobs/create"
            element={
              <ProtectedRoute role="EMPLOYER">
                <CreateJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-jobs/:id/edit"
            element={
              <ProtectedRoute role="EMPLOYER">
                <EditJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-jobs/:id/applications"
            element={
              <ProtectedRoute role="EMPLOYER">
                <JobApplicationsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminPaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs/create"
            element={
              <ProtectedRoute role="ADMIN">
                <CreateJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs/:id/edit"
            element={
              <ProtectedRoute role="ADMIN">
                <EditJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/create"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminCreateProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminEditProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminUserDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id/edit"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminUserDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blogs"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminBlogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blogs/create"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminCreateBlogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blogs/:id/edit"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminEditBlogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/newsletters"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminNewslettersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/newsletters/create"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminCreateNewsletterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/newsletters/subscribers"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminNewsletterSubscribersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services/create"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminCreateServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services/:id/edit"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminEditServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services/inquiries"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminServiceInquiriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/native-ads"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminNativeAdsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/native-ads/create"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminCreateNativeAdPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/native-ads/:id/edit"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminEditNativeAdPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sponsorship-posts"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminSponsorshipPostsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sponsorship-posts/create"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminCreateSponsorshipPostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sponsorship-posts/:id/edit"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminEditSponsorshipPostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/affiliate/programs"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminAffiliateProgramsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/affiliate/programs/create"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminCreateAffiliateProgramPage />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Routes */}
          <Route
            path="/affiliate/dashboard"
            element={
              <ProtectedRoute>
                <AffiliateDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
