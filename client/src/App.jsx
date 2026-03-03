import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AnimatedBackground from './components/AnimatedBackground';
import CustomCursor from './components/CustomCursor';

/* ── Lazy-loaded pages ── */
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const Alerts = lazy(() => import('./pages/Alerts'));

/* Page-level loading skeleton */
const PageSkeleton = () => (
    <div className="space-y-6 page-enter">
        <div className="skeleton skeleton-heading" style={{ width: '30%' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton" style={{ height: 300, borderRadius: '1rem' }} />
            <div className="skeleton" style={{ height: 300, borderRadius: '1rem' }} />
        </div>
    </div>
);

/* Layout wrapper for authenticated pages */
const AppLayout = () => (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-primary)' }}>
        {/* Background layers */}
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
        <div className="bg-glow bg-glow-3" />
        <div className="grid-overlay" />
        <div className="noise-overlay" />

        {/* Animated gold particle canvas */}
        <AnimatedBackground />

        {/* Custom cursor */}
        <CustomCursor />

        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            <ErrorBoundary>
                <Suspense fallback={<PageSkeleton />}>
                    <Outlet />
                </Suspense>
            </ErrorBoundary>
        </main>
    </div>
);

const App = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <AnimatedBackground />
                <div className="text-center relative z-10">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>
                        Loading FinSight…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <Routes>
                {/* Public routes */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
                />
                <Route
                    path="/register"
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
                />

                {/* Protected routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/alerts" element={<Alerts />} />
                </Route>

                {/* Default redirect */}
                <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
            </Routes>
        </ErrorBoundary>
    );
};

export default App;
