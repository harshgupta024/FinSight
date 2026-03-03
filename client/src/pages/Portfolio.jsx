/**
 * Portfolio — Gold-themed with TiltCards, skeleton loading
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import TiltCard from '../components/TiltCard';
import api from '../services/api';

const Portfolio = () => {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ symbol: '', name: '', quantity: '', avgBuyPrice: '' });

    const fetchPortfolio = async () => {
        try {
            const res = await api.get('/portfolio');
            const data = res.data?.data;
            setPortfolio(data?.portfolio || data || { assets: [] });
        } catch {
            setPortfolio({ assets: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPortfolio(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/portfolio/asset', {
                symbol: form.symbol,
                name: form.name,
                type: 'crypto',
                quantity: Number(form.quantity),
                avgBuyPrice: Number(form.avgBuyPrice),
            });
            toast.success('Asset added!');
            setForm({ symbol: '', name: '', quantity: '', avgBuyPrice: '' });
            setShowForm(false);
            fetchPortfolio();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add asset');
        }
    };

    const handleDelete = async (assetId) => {
        try {
            await api.delete(`/portfolio/asset/${assetId}`);
            toast.success('Asset removed');
            fetchPortfolio();
        } catch {
            toast.error('Failed to remove');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 page-enter">
                <div className="skeleton skeleton-heading" style={{ width: '25%' }} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-card" />)}
                </div>
                <div className="skeleton" style={{ height: 300, borderRadius: '1rem' }} />
            </div>
        );
    }

    const assets = Array.isArray(portfolio?.assets) ? portfolio.assets : [];
    const totalInvested = assets.reduce((s, a) => s + (a.quantity || 0) * (a.avgBuyPrice || a.purchasePrice || 0), 0);

    return (
        <div className="page-enter space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between fade-slide-up">
                <div>
                    <h1 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--text-primary)' }}>
                        <span className="text-gradient">Portfolio</span>
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your crypto holdings</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary ripple text-sm">
                    {showForm ? '✕ Cancel' : '+ Add Asset'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { title: 'Total Invested', value: `$${totalInvested.toLocaleString()}`, icon: '◈' },
                    { title: 'Assets Held', value: assets.length, icon: '◆' },
                    { title: 'Avg. Position', value: `$${assets.length ? (totalInvested / assets.length).toFixed(2) : '0.00'}`, icon: '▲' },
                ].map((stat, i) => (
                    <TiltCard key={stat.title} className="p-5 fade-slide-up" style={{ animationDelay: `${(i + 1) * 0.08}s` }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="section-label">{stat.title}</span>
                            <span style={{ color: 'var(--gold)' }}>{stat.icon}</span>
                        </div>
                        <div className="text-xl font-bold number-animate" style={{ color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif" }}>
                            {stat.value}
                        </div>
                    </TiltCard>
                ))}
            </div>

            {/* Add form */}
            {showForm && (
                <TiltCard className="p-6 page-enter">
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif" }}>Add New Asset</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { key: 'symbol', label: 'Symbol', placeholder: 'BTC' },
                            { key: 'name', label: 'Name', placeholder: 'Bitcoin' },
                            { key: 'quantity', label: 'Quantity', placeholder: '0.5', type: 'number' },
                            { key: 'avgBuyPrice', label: 'Purchase Price ($)', placeholder: '67000', type: 'number' },
                        ].map(({ key, label, placeholder, type }) => (
                            <div key={key}>
                                <label className="block mb-1.5 section-label">{label}</label>
                                <input
                                    type={type || 'text'}
                                    className="input-field !pl-4"
                                    placeholder={placeholder}
                                    required
                                    value={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                />
                            </div>
                        ))}
                        <div className="sm:col-span-2 lg:col-span-4">
                            <button type="submit" className="btn-primary ripple text-sm">Add to Portfolio</button>
                        </div>
                    </form>
                </TiltCard>
            )}

            {/* Assets table */}
            <TiltCard className="overflow-hidden chart-container">
                <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif" }}>Holdings</h3>
                </div>
                {assets.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-3" style={{ color: 'var(--gold)' }}>◆</div>
                        <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No assets yet</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Add your first asset to start tracking</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Quantity</th>
                                    <th>Purchase Price</th>
                                    <th>Total Value</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {assets.map((asset, i) => (
                                    <tr key={asset._id} className="fade-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                                    style={{ background: 'linear-gradient(135deg, var(--gold), #f5d87a)', color: '#05060d' }}>
                                                    {asset.symbol.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{asset.name}</div>
                                                    <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{asset.symbol.toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-mono" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{asset.quantity}</td>
                                        <td className="font-mono" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>${(asset.avgBuyPrice || asset.purchasePrice || 0).toLocaleString()}</td>
                                        <td className="font-mono font-medium" style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>
                                            ${((asset.quantity || 0) * (asset.avgBuyPrice || asset.purchasePrice || 0)).toLocaleString()}
                                        </td>
                                        <td>
                                            <button onClick={() => handleDelete(asset._id)} className="btn-danger text-xs ripple">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </TiltCard>
        </div>
    );
};

export default Portfolio;
