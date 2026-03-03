/**
 * Alerts — Gold-themed with TiltCards, skeleton loading
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import TiltCard from '../components/TiltCard';
import api from '../services/api';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ coinId: '', symbol: '', targetPrice: '', direction: 'above' });

    const fetchAlerts = async () => {
        try {
            const res = await api.get('/alerts');
            const data = res.data?.data;
            setAlerts(Array.isArray(data) ? data : Array.isArray(data?.alerts) ? data.alerts : []);
        } catch {
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAlerts(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/alerts', {
                coinGeckoId: form.coinId,
                symbol: form.symbol,
                targetPrice: Number(form.targetPrice),
                direction: form.direction,
            });
            toast.success('Alert created!');
            setForm({ coinId: '', symbol: '', targetPrice: '', direction: 'above' });
            setShowForm(false);
            fetchAlerts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create alert');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/alerts/${id}`);
            toast.success('Alert deleted');
            fetchAlerts();
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 page-enter">
                <div className="skeleton skeleton-heading" style={{ width: '25%' }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-card" style={{ height: 180 }} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between fade-slide-up">
                <div>
                    <h1 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--text-primary)' }}>
                        <span className="text-gradient">Price Alerts</span>
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Get notified when prices hit your targets</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary ripple text-sm">
                    {showForm ? '✕ Cancel' : '+ New Alert'}
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <TiltCard className="p-6 page-enter">
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif" }}>Create Price Alert</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block mb-1.5 section-label">Coin ID</label>
                            <input type="text" className="input-field !pl-4" placeholder="bitcoin" required
                                value={form.coinId} onChange={(e) => setForm({ ...form, coinId: e.target.value })} />
                        </div>
                        <div>
                            <label className="block mb-1.5 section-label">Symbol</label>
                            <input type="text" className="input-field !pl-4" placeholder="BTC" required
                                value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
                        </div>
                        <div>
                            <label className="block mb-1.5 section-label">Target Price ($)</label>
                            <input type="number" className="input-field !pl-4" placeholder="70000" required
                                value={form.targetPrice} onChange={(e) => setForm({ ...form, targetPrice: e.target.value })} />
                        </div>
                        <div>
                            <label className="block mb-1.5 section-label">Direction</label>
                            <select className="input-field !pl-4" value={form.direction}
                                onChange={(e) => setForm({ ...form, direction: e.target.value })}>
                                <option value="above">▲ Above</option>
                                <option value="below">▼ Below</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-4">
                            <button type="submit" className="btn-primary ripple text-sm">Create Alert</button>
                        </div>
                    </form>
                </TiltCard>
            )}

            {/* Alert cards */}
            {alerts.length === 0 ? (
                <TiltCard className="p-12 text-center">
                    <div className="text-4xl mb-3" style={{ color: 'var(--gold)' }}>▲</div>
                    <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No alerts set</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create a price alert to get notified</p>
                </TiltCard>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {alerts.map((alert, i) => (
                        <TiltCard key={alert._id} className="p-5 fade-slide-up" style={{ animationDelay: `${(i + 1) * 0.08}s` }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                                        style={{ background: 'linear-gradient(135deg, var(--gold), #f5d87a)', color: '#05060d' }}>
                                        {alert.symbol.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{alert.symbol.toUpperCase()}</div>
                                        <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{alert.coinId || alert.coinGeckoId}</div>
                                    </div>
                                </div>
                                <span className={`badge ${alert.triggered ? 'badge-success' : 'badge-gold'}`}>
                                    {alert.triggered ? '✓ Triggered' : '◈ Active'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>{alert.direction === 'above' ? '▲' : '▼'}</span>
                                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    {alert.direction === 'above' ? 'Above' : 'Below'}
                                </span>
                                <span className="text-lg font-bold font-mono" style={{ color: 'var(--gold)' }}>
                                    ${alert.targetPrice.toLocaleString()}
                                </span>
                            </div>
                            <button onClick={() => handleDelete(alert._id)} className="btn-danger text-xs w-full ripple">
                                Delete Alert
                            </button>
                        </TiltCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Alerts;
