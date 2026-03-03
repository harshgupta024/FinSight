/**
 * Register Page – Enhanced with animations and theme support
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await register(form.name, form.email, form.password, form.confirmPassword);
        setLoading(false);
    };

    const fields = [
        { key: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
        { key: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg> },
        { key: 'password', type: 'password', label: 'Password', placeholder: '••••••••', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
        { key: 'confirmPassword', type: 'password', label: 'Confirm Password', placeholder: '••••••••', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12"
            style={{ background: 'var(--bg-primary)' }}>
            <div className="bg-glow bg-glow-1" />
            <div className="bg-glow bg-glow-2" />
            <AnimatedBackground />

            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            <div className="relative z-10 w-full max-w-md px-4 page-enter">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold glow-accent"
                        style={{ background: 'linear-gradient(135deg, var(--accent), #a855f7)' }}>
                        F
                    </div>
                    <h1 className="text-3xl font-bold text-gradient">Create Account</h1>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        Start tracking your portfolio today
                    </p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map(({ key, type, label, placeholder, icon }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {label}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                        {icon}
                                    </span>
                                    <input
                                        type={type}
                                        className="input-field"
                                        placeholder={placeholder}
                                        required
                                        value={form[key]}
                                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full ripple"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating account…
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
