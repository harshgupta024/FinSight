/**
 * Navbar – Gold-themed with LIVE badge and updated nav links
 */
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();

    const links = [
        { to: '/dashboard', label: 'Dashboard', icon: '◈' },
        { to: '/portfolio', label: 'Portfolio', icon: '◆' },
        { to: '/watchlist', label: 'Watchlist', icon: '★' },
        { to: '/alerts', label: 'Alerts', icon: '▲' },
        { to: '/ai-advisor', label: 'AI Advisor', icon: '◉' },
    ];

    return (
        <nav className="navbar fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                            style={{
                                background: 'linear-gradient(135deg, var(--gold), #f5d87a)',
                                color: '#05060d',
                                boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)',
                            }}>
                            ◈
                        </div>
                        <span className="text-lg font-bold text-gradient hidden sm:block"
                            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>
                            FinSight
                        </span>
                    </Link>

                    {/* Center nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(({ to, label, icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`nav-link ${pathname === to ? 'active' : ''}`}
                            >
                                <span className="mr-1.5" style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem' }}>{icon}</span>
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right section */}
                    <div className="flex items-center gap-3">
                        {/* LIVE badge */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '0.65rem',
                                letterSpacing: '0.05em',
                            }}>
                            <div className="pulse-dot" />
                            <span style={{ color: 'var(--text-muted)' }}>LIVE</span>
                        </div>

                        {/* Theme toggle */}
                        <ThemeToggle />

                        {/* User avatar + logout */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{
                                    background: 'linear-gradient(135deg, var(--gold), #f5d87a)',
                                    color: '#05060d',
                                    boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)',
                                }}>
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <button
                                onClick={logout}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                style={{
                                    color: 'var(--text-muted)',
                                    border: '1px solid var(--border-color)',
                                    fontFamily: "'DM Sans', sans-serif",
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
                    {links.map(({ to, label, icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`nav-link whitespace-nowrap text-xs ${pathname === to ? 'active' : ''}`}
                        >
                            <span className="mr-1">{icon}</span>
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
