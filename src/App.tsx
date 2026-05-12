import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from './lib/animations';
import AuthPage from './pages/AuthPage';
import ConfirmEmail from './pages/ConfirmEmail';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AddPG from './pages/AddPG';
import EditPG from './pages/EditPG';
import PGRooms from './pages/PGRooms';

import Maintenance from './pages/Maintenance';
import Tenants from './pages/Tenants';
import Rooms from './pages/Rooms';
import Transactions from './pages/Transactions';
import Expenses from './pages/Expenses';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import MyPGs from './pages/MyPGs';
import MainLayout from './components/MainLayout';
import MinimalLayout from './components/MinimalLayout';
import OnboardingGuard from './components/OnboardingGuard';
import { useResource } from './data';
import { useAuthStore } from './store';
import { Loader2 } from 'lucide-react';
import CommandPalette from './components/ui/CommandPalette';
import { FeedbackProvider } from './components/FeedbackProvider';
import { DataProvider } from './data';
import { Analytics } from '@vercel/analytics/react';

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard>
      <MainLayout>
        <AnimatedPage>{children}</AnimatedPage>
      </MainLayout>
    </OnboardingGuard>
  );
}

/**
 * Special wrapper for `/pg/add`. When the user has zero PGs we strip the
 * sidebar and chrome down to a logo + logout + welcome banner so the user
 * only sees the form. Once they have at least one PG we use the regular
 * Protected layout so they can navigate around while adding more.
 */
function AddPGRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.token);
  const { data: pgs, loading } = useResource('pgs', { joinPg: false, enabled: isAuthenticated });

  if (!isAuthenticated) {
    // Same guard contract as Protected/OnboardingGuard.
    return <OnboardingGuard><></></OnboardingGuard>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0]">
        <Loader2 size={28} className="animate-spin text-[#1C6C41]" />
      </div>
    );
  }

  const hasNoPGs = (pgs?.length ?? 0) === 0;

  if (hasNoPGs) {
    return (
      <MinimalLayout>
        <AnimatedPage>{children}</AnimatedPage>
      </MinimalLayout>
    );
  }

  // 1+ PGs: user is adding an additional one, give them full chrome.
  return (
    <MainLayout>
      <AnimatedPage>{children}</AnimatedPage>
    </MainLayout>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/auth"
          element={
            <AnimatedPage>
              <AuthPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/confirm-email"
          element={
            <AnimatedPage>
              <ConfirmEmail />
            </AnimatedPage>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AnimatedPage>
              <ResetPassword />
            </AnimatedPage>
          }
        />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/pg/add" element={<AddPGRoute><AddPG /></AddPGRoute>} />
        <Route path="/pg/edit/:id" element={<Protected><EditPG /></Protected>} />
        <Route path="/pg/:id/rooms" element={<Protected><PGRooms /></Protected>} />
        <Route path="/maintenance" element={<Protected><Maintenance /></Protected>} />
        <Route path="/tenants" element={<Protected><Tenants /></Protected>} />
        <Route path="/rooms" element={<Protected><Rooms /></Protected>} />
        <Route path="/transactions" element={<Protected><Transactions /></Protected>} />
        <Route path="/expenses" element={<Protected><Expenses /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="/pgs" element={<Protected><MyPGs /></Protected>} />
        <Route
          path="/"
          element={
            <AnimatedPage>
              <AuthPage />
            </AnimatedPage>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <FeedbackProvider>
          <CommandPalette />
          <AppRoutes />
          <Analytics />
        </FeedbackProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
