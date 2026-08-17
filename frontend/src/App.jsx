import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slide, ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/useAuth';
import { AuthExpirationProvider } from './context/AuthExpirationProvider';
import { useAuthExpiration } from './context/useAuthExpiration';
import { ThemeModeProvider } from './context/ThemeModeProvider';
import { CssBaseline } from '@mui/material';

// Component imports
import PageSkeleton, { RouteAwareSkeleton } from './components/skeleton';
import PageNotFound from './components/pageNotFound';
import ErrorBoundary from './components/errorBoundary';

// Route imports
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ProtectedRouteList } from './routes/ProtectedRouteList';
import { PublicRoute } from './routes/PublicRoute';
import { PublicRoutesList } from './routes/PublicRouteList';
import { RenderRoutes } from './routes/RenderRoutes';

// Network status imports
import { useGetNetworkStatus } from './hooks/useNetworkStatus';
import { OfflineContainer } from './components/offlineContainer';
import { setAuthExpirationHandler } from './configurations/axiosConfig';
import AxiosConfig from './configurations/axiosConfig';

// Theme imports
import AppTheme from './theme/AppTheme';
import './App.css';

const Login = lazy(() => import('./pages/public/Login'));
const Logout = lazy(() => import('./pages/protected/Logout'));
const PublicLayout = lazy(() => import('./layout/publicLayout/PublicLayout'));
const ProtectedLayout = lazy(() => import('./layout/protectedLayout/ProtectedLayout'));
const LandingPage = lazy(() => import('./pages/public/LandingPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 0,
    },
  },
});

const AxiosInterceptorSetup = () => {
  const { showExpirationDialog } = useAuthExpiration();

  useEffect(() => {
    setAuthExpirationHandler(showExpirationDialog);
  }, [showExpirationDialog]);

  return null;
};

const HealthPoller = () => {
  useEffect(() => {
    const ping = () => {
      AxiosConfig.get('/health').catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
};

const App = () => {
  return (
    <ThemeModeProvider>
      <AppTheme>
        <CssBaseline enableColorScheme />
        <QueryClientProvider client={queryClient}>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            limit={3}
            transition={Slide}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <AuthProvider>
            <AuthExpirationProvider>
              <Router>
                <Suspense fallback={<RouteAwareSkeleton />}>
                  <AxiosInterceptorSetup />
                  <HealthPoller />
                  <ErrorBoundary>
                    <AppRoutes />
                  </ErrorBoundary>
                </Suspense>
              </Router>
            </AuthExpirationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </AppTheme>
    </ThemeModeProvider>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const { isOnline } = useGetNetworkStatus();

  if (isAuthenticated === undefined) return <PageSkeleton />;
  if (!isOnline) return <OfflineContainer />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />

      {/* PUBLIC ROUTES — redirect authenticated users to /dashboard */}
      <Route element={<PublicRoute><PublicLayout /></PublicRoute>}>
        <Route index element={<LandingPage />} />
        {RenderRoutes(PublicRoutesList)}
      </Route>

      {/* PROTECTED ROUTES — redirect unauthenticated users to / */}
      <Route element={
        <ProtectedRoute>
          <ProtectedLayout />
        </ProtectedRoute>}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        {RenderRoutes(ProtectedRouteList)}
        <Route path="*" element={<PageNotFound />} />
      </Route>

      {/* GLOBAL CATCH-ALL — shown for any unmatched route */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default App;
