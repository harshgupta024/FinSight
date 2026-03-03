/**
 * Dashboard — Gold-themed with TiltCards, animated counters, skeleton loading
 */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import TiltCard from '../components/TiltCard';
import PriceLineChart from '../components/charts/LineChart';
import VolumeBarChart from '../components/charts/BarChart';
import api from '../services/api';

/* ── Animated number counter hook ── */
const useAnimatedValue = (target, duration = 40) => {
    const [value, setValue] = useState(0);
    const frameRef = useRef(0);

    useEffect(() => {
        if (!target) return;
        let frame = 0;
        const step = () => {
            frame++;
            const progress = Math.min(frame / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setValue(target * eased);
            if (frame < duration) {
                frameRef.current = requestAnimationFrame(step);
            }
        };
        frameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration]);

    return value;
};

/* ── Skeleton loader ── */
const DashboardSkeleton = () => (
    <div className="space-y-6 page-enter">
        <div className="skeleton skeleton-heading" style={{ width: '35%' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton" style={{ height: 300, borderRadius: '1rem' }} />
            <div className="skeleton" style={{ height: 300, borderRadius: '1rem' }} />
        </div>
        <div className="skeleton" style={{ height: 400, borderRadius: '1rem' }} />
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/market/top?limit=10');
                const responseData = res.data?.data;
                const coins = Array.isArray(responseData) ? responseData
                    : Array.isArray(responseData?.coins) ? responseData.coins
                        : [];
                setMarketData(coins);
            } catch {
                setMarketData([
                    { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 67432, price_change_percentage_24h: 2.34, total_volume: 32000000000, market_cap: 1320000000000 },
                    { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 3521, price_change_percentage_24h: -1.12, total_volume: 18000000000, market_cap: 423000000000 },
                    { id: 'solana', name: 'Solana', symbol: 'sol', current_price: 142.5, price_change_percentage_24h: 5.67, total_volume: 3200000000, market_cap: 62000000000 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const safeData = Array.isArray(marketData) ? marketData : [];
    const totalMarketCap = safeData.reduce((sum, c) => sum + (c.market_cap || 0), 0);
    const totalVolume = safeData.reduce((sum, c) => sum + (c.total_volume || 0), 0);
    const avgChange = safeData.length
        ? safeData.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / safeData.length
        : 0;

    // Animated values
    const animatedCap = useAnimatedValue(totalMarketCap);
    const animatedVol = useAnimatedValue(totalVolume);

    const formatCurrency = (n) => {
        if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
        if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
        return `$${n.toLocaleString()}`;
    };

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="page-enter space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between fade-slide-up">
                <div>
                    <h1 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--text-primary)' }}>
                        Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Trader'}</span>
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                        Here's your market overview
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="pulse-dot" />
                    <span className="section-label">Live Data</span>
                </div>
            </div>

            {/* Stats Cards with TiltCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        title: 'Total Market Cap',
                        value: formatCurrency(animatedCap),
                        icon: '◈',
                        trend: avgChange >= 0 ? 'up' : 'down',
                        trendValue: `${Math.abs(avgChange).toFixed(2)}%`,
                    },
                    {
                        title: '24h Volume',
                        value: formatCurrency(animatedVol),
                        icon: '▲',
                    },
                    {
                        title: 'Tracked Coins',
                        value: safeData.length.toString(),
                        icon: '◆',
                    },
                    {
                        title: 'Market Trend',
                        value: avgChange >= 0 ? 'Bullish' : 'Bearish',
                        icon: avgChange >= 0 ? '↑' : '↓',
                        trend: avgChange >= 0 ? 'up' : 'down',
                        trendValue: `${Math.abs(avgChange).toFixed(2)}%`,
                    },
                ].map((stat, i) => (
                    <TiltCard
                        key={stat.title}
                        className="p-5 fade-slide-up"
                        style={{ animationDelay: `${(i + 1) * 0.08}s` }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                {stat.title}
                            </span>
                            <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>{stat.icon}</span>
                        </div>
                        <div className="text-xl font-bold number-animate" style={{ color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
                            {stat.value}
                        </div>
                        {stat.trend && (
                            <div className="mt-2">
                                <span className={`badge ${stat.trend === 'up' ? 'badge-success' : 'badge-danger'}`}>
                                    {stat.trend === 'up' ? '▲' : '▼'} {stat.trendValue}
                                </span>
                            </div>
                        )}
                    </TiltCard>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TiltCard className="p-6 chart-container">
                    <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif" }}>
                        Price Overview
                    </h3>
                    <PriceLineChart data={safeData.map((c) => ({ name: c.symbol.toUpperCase(), price: c.current_price }))} />
                </TiltCard>
                <TiltCard className="p-6 chart-container">
                    <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif" }}>
                        24h Volume
                    </h3>
                    <VolumeBarChart data={safeData.map((c) => ({ name: c.symbol.toUpperCase(), volume: c.total_volume / 1e9 }))} />
                </TiltCard>
            </div>

            {/* Live Prices Table */}
            <TiltCard className="overflow-hidden chart-container">
                <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif" }}>
                        Live Market Prices
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Coin</th>
                                <th>Price</th>
                                <th>24h Change</th>
                                <th>Market Cap</th>
                                <th>Volume</th>
                            </tr>
                        </thead>
                        <tbody>
                            {safeData.map((coin, i) => (
                                <tr key={coin.id} className="fade-slide-up" style={{ animationDelay: `${(i + 5) * 0.05}s` }}>
                                    <td className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{i + 1}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                                style={{ background: 'linear-gradient(135deg, var(--gold), #f5d87a)', color: '#05060d' }}>
                                                {coin.symbol.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{coin.name}</div>
                                                <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{coin.symbol.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-mono font-medium" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                        ${coin.current_price?.toLocaleString()}
                                    </td>
                                    <td>
                                        <span className={`badge ${coin.price_change_percentage_24h >= 0 ? 'badge-success' : 'badge-danger'}`}>
                                            {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatCurrency(coin.market_cap)}</td>
                                    <td className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatCurrency(coin.total_volume)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TiltCard>
        </div>
    );
};

export default Dashboard;
