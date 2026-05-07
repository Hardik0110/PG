import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from './lib/animations';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AddPG from './pages/AddPG';
import EditPG from './pages/EditPG';

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
import CommandPalette from './components/ui/CommandPalette';
import { ToastProvider } from './components/ui/Toast';

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
          path="/dashboard"
          element={
            <MainLayout>
              <AnimatedPage>
                <Dashboard />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/pg/add"
          element={
            <MainLayout>
              <AnimatedPage>
                <AddPG />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/pg/edit/:id"
          element={
            <MainLayout>
              <AnimatedPage>
                <EditPG />
              </AnimatedPage>
            </MainLayout>
          }
        />

        <Route
          path="/maintenance"
          element={
            <MainLayout>
              <AnimatedPage>
                <Maintenance />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/tenants"
          element={
            <MainLayout>
              <AnimatedPage>
                <Tenants />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/rooms"
          element={
            <MainLayout>
              <AnimatedPage>
                <Rooms />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/transactions"
          element={
            <MainLayout>
              <AnimatedPage>
                <Transactions />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/expenses"
          element={
            <MainLayout>
              <AnimatedPage>
                <Expenses />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <AnimatedPage>
                <Profile />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <MainLayout>
              <AnimatedPage>
                <Settings />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <MainLayout>
              <AnimatedPage>
                <Notifications />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/pgs"
          element={
            <MainLayout>
              <AnimatedPage>
                <MyPGs />
              </AnimatedPage>
            </MainLayout>
          }
        />
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
      <ToastProvider>
        <CommandPalette />
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
