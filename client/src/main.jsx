import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import queryClient from './services/queryClient';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

/* Global loading skeleton for lazy-loaded pages */
const GlobalSkeleton = () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>
                Loading…
            </p>
        </div>
    </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                        <Suspense fallback={<GlobalSkeleton />}>
                            <App />
                        </Suspense>
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(12px)',
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '0.875rem',
                                },
                                success: {
                                    iconTheme: { primary: '#d4af37', secondary: '#05060d' },
                                },
                                error: {
                                    iconTheme: { primary: '#ff453a', secondary: '#05060d' },
                                },
                                loading: {
                                    iconTheme: { primary: '#d4af37', secondary: 'var(--bg-card)' },
                                },
                            }}
                        />
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);
