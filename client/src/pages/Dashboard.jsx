/**
 * Dashboard Page – Theme-aware with chart animations
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/StatsCard';
import PriceLineChart from '../components/charts/LineChart';
import VolumeBarChart from '../components/charts/BarChart';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/market/top?limit=10');
                const responseData = res.data?.data;
                // API may return { data: { coins: [...] } } or { data: [...] }
                const coins = Array.isArray(responseData) ? responseData
                    : Array.isArray(responseData?.coins) ? responseData.coins
                        : [];
                setMarketData(coins);
            } catch {
                // Fallback sample data for demo
                setMarketData([
                    { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 67432, price_change_percentage_24h: 2.34, total_volume: 32000000000, market_cap: 1320000000000 },
                    { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 3521, price_change_percentage_24h: -1.12, total_volume: 18000000000, market_cap: 423000000000 },
                    { id: 'solana', name: 'Solana', symbol: 'sol', current_price: 142.5, price_change_percentage_24h: 5.67, total_volume: 3200000000, market_cap: 62000000000 },
                    { id: 'cardano', name: 'Cardano', symbol: 'ada', current_price: 0.62, price_change_percentage_24h: -0.45, total_volume: 450000000, market_cap: 22000000000 },
                    { id: 'ripple', name: 'XRP', symbol: 'xrp', current_price: 0.54, price_change_percentage_24h: 1.23, total_volume: 1200000000, market_cap: 29000000000 },
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

    const formatCurrency = (n) => {
        if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
        if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
        return `$${n.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="page-enter space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Trader'}</span>
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Here's your market overview
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="pulse-dot" />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Live Data</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Market Cap" value={formatCurrency(totalMarketCap)} icon="📈" trend={avgChange >= 0 ? 'up' : 'down'} trendValue={`${Math.abs(avgChange).toFixed(2)}%`} className="stagger-1" />
                <StatsCard title="24h Volume" value={formatCurrency(totalVolume)} icon="💹" className="stagger-2" />
                <StatsCard title="Tracked Coins" value={safeData.length} icon="🪙" className="stagger-3" />
                <StatsCard title="Market Trend" value={avgChange >= 0 ? 'Bullish' : 'Bearish'} icon={avgChange >= 0 ? '🐂' : '🐻'} trend={avgChange >= 0 ? 'up' : 'down'} trendValue={`${Math.abs(avgChange).toFixed(2)}%`} className="stagger-4" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 chart-container">
                    <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Price Overview</h3>
                    <PriceLineChart data={safeData.map((c) => ({ name: c.symbol.toUpperCase(), price: c.current_price }))} />
                </div>
                <div className="glass-card p-6 chart-container">
                    <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>24h Volume</h3>
                    <VolumeBarChart data={safeData.map((c) => ({ name: c.symbol.toUpperCase(), volume: c.total_volume / 1e9 }))} />
                </div>
            </div>

            {/* Live Prices Table */}
            <div className="glass-card overflow-hidden chart-container">
                <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Live Market Prices</h3>
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
                                <tr key={coin.id}>
                                    <td className="font-medium" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                style={{ background: 'linear-gradient(135deg, var(--accent), #a855f7)' }}>
                                                {coin.symbol.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{coin.name}</div>
                                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{coin.symbol.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                                        ${coin.current_price?.toLocaleString()}
                                    </td>
                                    <td>
                                        <span className={`badge ${coin.price_change_percentage_24h >= 0 ? 'badge-success' : 'badge-danger'}`}>
                                            {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(coin.market_cap)}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{formatCurrency(coin.total_volume)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
