/**
 * Login Page — Gold-themed with particle canvas
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AnimatedBackground from '../components/AnimatedBackground';
import CustomCursor from '../components/CustomCursor';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await login(form.email, form.password);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: 'var(--bg-primary)' }}>
            {/* Background layers */}
            <div className="bg-glow bg-glow-1" />
            <div className="bg-glow bg-glow-2" />
            <div className="grid-overlay" />
            <AnimatedBackground />
            <CustomCursor />

            {/* Theme toggle */}
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            {/* Login card */}
            <div className="relative z-10 w-full max-w-md px-4 page-enter">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                        style={{
                            background: 'linear-gradient(135deg, var(--gold), #f5d87a)',
                            color: '#05060d',
                            boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
                        }}>
                        ◈
                    </div>
                    <h1 className="text-3xl font-bold text-gradient" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        Sign in to your FinSight account
                    </p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block mb-2 section-label">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                </span>
                                <input type="email" className="input-field" placeholder="you@example.com" required
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 section-label">Password</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </span>
                                <input type="password" className="input-field" placeholder="••••••••" required
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full ripple">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
