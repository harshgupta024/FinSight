import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <App />
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
        </BrowserRouter>
    </React.StrictMode>
);
