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
import DashboardPage from "./pages/DashboardPage";
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
import AdminAdsPage from "./pages/admin/AdminAdsPage";
import AdminCreateAdPage from "./pages/admin/AdminCreateAdPage";
import AdminEditAdPage from "./pages/admin/AdminEditAdPage";
import AdminAdDetailPage from "./pages/admin/AdminAdDetailPage";

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes - Any authenticated user */}
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
            path="/admin/ads"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminAdsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ads/create"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminCreateAdPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ads/:id"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminAdDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ads/:id/edit"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminEditAdPage />
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
