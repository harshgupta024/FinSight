import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AnimatedBackground from './components/AnimatedBackground';
import CustomCursor from './components/CustomCursor';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import Alerts from './pages/Alerts';

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
                <Outlet />
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
