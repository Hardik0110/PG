import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from './lib/animations';
import AuthPage from './pages/AuthPage';
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
import OnboardingGuard from './components/OnboardingGuard';
import CommandPalette from './components/ui/CommandPalette';
import { FeedbackProvider } from './components/FeedbackProvider';
import { DataProvider } from './data';

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
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/pg/add" element={<Protected><AddPG /></Protected>} />
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
        </FeedbackProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
