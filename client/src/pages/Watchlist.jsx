/**
 * Watchlist Page – Enhanced with theme support
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const fetchWatchlist = async () => {
        try {
            const res = await api.get('/watchlist');
            const data = res.data?.data;
            // Backend returns { watchlist: { items: [...] } }
            setWatchlist(data?.watchlist || data || { items: [] });
        } catch {
            setWatchlist({ items: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWatchlist(); }, []);

    const handleSearch = async () => {
        if (!search.trim()) return;
        setSearching(true);
        try {
            const res = await api.get(`/market/search?q=${encodeURIComponent(search)}`);
            const data = res.data?.data;
            const coins = Array.isArray(data) ? data : Array.isArray(data?.coins) ? data.coins : [];
            setSearchResults(coins.slice(0, 8));
        } catch {
            setSearchResults([]);
            toast.error('Search failed');
        } finally {
            setSearching(false);
        }
    };

    const handleAdd = async (symbol, name) => {
        try {
            await api.post('/watchlist', { symbol, name });
            toast.success(`${name} added to watchlist`);
            setSearchResults([]);
            setSearch('');
            fetchWatchlist();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add');
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await api.delete(`/watchlist/${itemId}`);
            toast.success('Removed from watchlist');
            fetchWatchlist();
        } catch {
            toast.error('Failed to remove');
        }
    };

    if (loading) return <div className="flex justify-center py-32"><div className="spinner" /></div>;

    const items = watchlist?.items || [];

    return (
        <div className="page-enter space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    <span className="text-gradient">Watchlist</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track your favorite cryptocurrencies</p>
            </div>

            {/* Search */}
            <div className="glass-card p-5">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </span>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search coins (e.g. Bitcoin, ETH)…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button onClick={handleSearch} disabled={searching} className="btn-primary ripple text-sm whitespace-nowrap">
                        {searching ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Searching…
                            </span>
                        ) : 'Search'}
                    </button>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchResults.map((coin) => (
                            <div key={coin.id} className="flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.01]"
                                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                                <div className="flex items-center gap-2">
                                    {coin.thumb && <img src={coin.thumb} alt="" className="w-6 h-6 rounded-full" />}
                                    <div>
                                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{coin.name}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{coin.symbol?.toUpperCase()}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAdd(coin.symbol, coin.name)}
                                    className="text-xs font-medium px-3 py-1.5 rounded-lg ripple"
                                    style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
                                >
                                    + Add
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Watchlist items */}
            <div className="glass-card overflow-hidden chart-container">
                <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Your Watchlist</h3>
                        <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>{items.length} coins</span>
                    </div>
                </div>
                {items.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-3">⭐</div>
                        <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Watchlist is empty</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Search and add coins to track them</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Coin</th>
                                    <th>Symbol</th>
                                    <th>Added</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                    style={{ background: 'linear-gradient(135deg, var(--accent), #a855f7)' }}>
                                                    {item.symbol.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="font-mono" style={{ color: 'var(--text-muted)' }}>{item.symbol.toUpperCase()}</td>
                                        <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {item.addedAt || item.createdAt
                                                ? new Date(item.addedAt || item.createdAt).toLocaleDateString()
                                                : '—'}
                                        </td>
                                        <td>
                                            <button onClick={() => handleRemove(item._id)} className="btn-danger text-xs ripple">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watchlist;
