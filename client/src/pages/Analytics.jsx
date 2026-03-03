/**
 * Analytics Page — Gold-themed advanced portfolio analytics
 * P&L heatmap, BTC benchmark, performers, allocations, VaR
 */
import { useQuery } from '@tanstack/react-query';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts';
import TiltCard from '../components/TiltCard';
import api from '../services/api';

const GOLD = '#d4af37';
const GREEN = '#30d158';
const RED = '#ff453a';
const ORANGE = '#ff9f0a';
const CHART_BG = 'rgba(255,255,255,0.03)';

/* ── Custom Tooltip ── */
const GoldTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(10,12,20,0.95)', border: `1px solid ${GOLD}40`,
            borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(12px)',
        }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontSize: '0.8rem', fontWeight: 600 }}>
                    {p.name}: {typeof p.value === 'number' ? (p.name?.includes('%') || p.name?.includes('Return') ? `${p.value.toFixed(2)}%` : `$${p.value.toLocaleString()}`) : p.value}
                </div>
            ))}
        </div>
    );
};

/* ── P&L Heatmap Calendar ── */
const PnLHeatmap = ({ data }) => {
    if (!data?.length) return null;
    const maxAbs = Math.max(...data.map(d => Math.abs(d.pnl)), 1);
    return (
        <div>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="text-center text-xs py-1" style={{ color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem' }}>{d}</div>
                ))}
                {/* Pad first week */}
                {data.length > 0 && Array.from({ length: new Date(data[0].date).getDay() === 0 ? 6 : new Date(data[0].date).getDay() - 1 }).map((_, i) => (
                    <div key={`pad-${i}`} />
                ))}
                {data.map((d, i) => {
                    const intensity = Math.min(Math.abs(d.pnl) / maxAbs, 1);
                    const bg = d.pnl >= 0
                        ? `rgba(48, 209, 88, ${0.15 + intensity * 0.6})`
                        : `rgba(255, 69, 58, ${0.15 + intensity * 0.6})`;
                    return (
                        <div key={i} title={`${d.date}: ${d.pnl >= 0 ? '+' : ''}$${d.pnl.toLocaleString()} (${d.percentage}%)`}
                            className="rounded-md aspect-square flex items-center justify-center text-xs font-mono cursor-pointer transition-all hover:scale-110"
                            style={{ background: bg, color: d.pnl >= 0 ? GREEN : RED, fontSize: '0.6rem', border: '1px solid transparent' }}>
                            {new Date(d.date).getDate()}
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <div className="w-3 h-3 rounded" style={{ background: `rgba(255, 69, 58, 0.6)` }} /> Loss
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <div className="w-3 h-3 rounded" style={{ background: `rgba(48, 209, 88, 0.6)` }} /> Profit
                </div>
            </div>
        </div>
    );
};

/* ── Allocation Donut ── */
const DONUT_COLORS = [GOLD, '#f5d87a', '#b8860b', '#daa520', '#cd853f', '#ffd700', '#e6c300'];

const AllocationDonut = ({ data }) => {
    if (!data?.length) return null;
    return (
        <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
                <PieChart>
                    <Pie data={data} dataKey="percentage" nameKey="symbol" cx="50%" cy="50%"
                        innerRadius={40} outerRadius={60} paddingAngle={2} strokeWidth={0}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 flex-1">
                {data.map((a, i) => (
                    <div key={a.symbol} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                            <span style={{ color: 'var(--text-secondary)' }}>{a.symbol}</span>
                        </div>
                        <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{a.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ── Main Page ── */
const Analytics = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['portfolio', 'analytics'],
        queryFn: async () => {
            const { data } = await api.get('/portfolio/analytics');
            return data?.data || {};
        },
        staleTime: 60_000,
    });

    const { dailyPnL = [], performanceVsBTC = [], topPerformers = [], bottomPerformers = [], allocations = [], riskMetrics = {} } = data || {};

    if (isLoading) {
        return (
            <div className="page-enter space-y-6">
                <div className="skeleton skeleton-heading" style={{ width: '25%' }} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 300, animationDelay: `${i * 0.1}s` }} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter space-y-6">
            {/* Header */}
            <div className="fade-slide-up">
                <h1 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--text-primary)' }}>
                    <span className="text-gradient">Advanced Analytics</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Deep insights into your portfolio performance
                </p>
            </div>

            {/* Risk Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 fade-slide-up" style={{ animationDelay: '0.05s' }}>
                {[
                    { label: 'VaR (95%)', value: `${riskMetrics.var95}%`, sub: 'Daily risk', color: ORANGE },
                    { label: 'VaR (99%)', value: `${riskMetrics.var99}%`, sub: 'Extreme risk', color: RED },
                    { label: 'CVaR', value: `${riskMetrics.cvar}%`, sub: 'Expected shortfall', color: RED },
                    { label: 'Volatility', value: `${riskMetrics.volatility}%`, sub: 'Daily std dev', color: GOLD },
                ].map((m, i) => (
                    <TiltCard key={i} className="p-4 text-center">
                        <div className="section-label mb-1">{m.label}</div>
                        <div className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif", color: m.color }}>{m.value}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.sub}</div>
                    </TiltCard>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* P&L Heatmap */}
                <TiltCard className="p-5 fade-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h3 className="font-semibold mb-4" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>
                        Daily P&L Heatmap
                    </h3>
                    <PnLHeatmap data={dailyPnL} />
                </TiltCard>

                {/* Allocation Donut */}
                <TiltCard className="p-5 fade-slide-up" style={{ animationDelay: '0.15s' }}>
                    <h3 className="font-semibold mb-4" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>
                        Asset Allocation
                    </h3>
                    {allocations.length > 0 ? (
                        <AllocationDonut data={allocations} />
                    ) : (
                        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No assets in portfolio</div>
                    )}
                </TiltCard>
            </div>

            {/* Portfolio vs BTC Benchmark */}
            <TiltCard className="p-5 fade-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-semibold mb-4" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>
                    Portfolio vs BTC Benchmark
                    <span className="text-xs ml-2 font-normal" style={{ color: 'var(--text-muted)' }}>30 days</span>
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={performanceVsBTC}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10, fontFamily: "'Space Mono', monospace" }}
                            tickFormatter={(v) => v?.slice(5)} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10, fontFamily: "'Space Mono', monospace" }}
                            tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<GoldTooltip />} />
                        <Line type="monotone" dataKey="portfolio" stroke={GOLD} strokeWidth={2.5} dot={false} name="Portfolio Return" />
                        <Line type="monotone" dataKey="btc" stroke="#f7931a" strokeWidth={2} dot={false} name="BTC Return" strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-3">
                    <div className="flex items-center gap-2 text-xs" style={{ color: GOLD }}>
                        <div className="w-4 h-0.5" style={{ background: GOLD }} /> Portfolio
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#f7931a' }}>
                        <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#f7931a' }} /> Bitcoin
                    </div>
                </div>
            </TiltCard>

            {/* Daily P&L Bar Chart */}
            <TiltCard className="p-5 fade-slide-up" style={{ animationDelay: '0.25s' }}>
                <h3 className="font-semibold mb-4" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>
                    Daily P&L
                    <span className="text-xs ml-2 font-normal" style={{ color: 'var(--text-muted)' }}>Last 30 days</span>
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dailyPnL}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 9, fontFamily: "'Space Mono', monospace" }}
                            tickFormatter={(v) => v?.slice(8)} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10, fontFamily: "'Space Mono', monospace" }}
                            tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<GoldTooltip />} />
                        <Bar dataKey="pnl" name="Daily P&L" radius={[3, 3, 0, 0]}>
                            {dailyPnL.map((d, i) => (
                                <Cell key={i} fill={d.pnl >= 0 ? GREEN : RED} fillOpacity={0.7} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </TiltCard>

            {/* Top & Bottom Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top */}
                <TiltCard className="overflow-hidden fade-slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="font-semibold flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>
                            <span style={{ color: GREEN }}>▲</span> Top Performers
                        </h3>
                    </div>
                    {topPerformers.length > 0 ? topPerformers.map((p, i) => (
                        <div key={p.symbol} className="p-4 flex items-center justify-between border-b fade-slide-up"
                            style={{ borderColor: 'var(--border-color)', animationDelay: `${0.3 + i * 0.05}s` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                                    style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
                                    {p.symbol?.slice(0, 2)}
                                </div>
                                <div>
                                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name || p.symbol}</div>
                                    <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{p.symbol}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold" style={{ color: p.gainLossPercent >= 0 ? GREEN : RED }}>
                                    {p.gainLossPercent >= 0 ? '+' : ''}{p.gainLossPercent}%
                                </div>
                                <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                                    {p.gainLoss >= 0 ? '+' : ''}${p.gainLoss?.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No assets yet</div>
                    )}
                </TiltCard>

                {/* Bottom */}
                <TiltCard className="overflow-hidden fade-slide-up" style={{ animationDelay: '0.35s' }}>
                    <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="font-semibold flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>
                            <span style={{ color: RED }}>▼</span> Bottom Performers
                        </h3>
                    </div>
                    {bottomPerformers.length > 0 ? bottomPerformers.map((p, i) => (
                        <div key={p.symbol} className="p-4 flex items-center justify-between border-b fade-slide-up"
                            style={{ borderColor: 'var(--border-color)', animationDelay: `${0.35 + i * 0.05}s` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                                    style={{ background: 'rgba(255,69,58,0.1)', color: RED }}>
                                    {p.symbol?.slice(0, 2)}
                                </div>
                                <div>
                                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name || p.symbol}</div>
                                    <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{p.symbol}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold" style={{ color: p.gainLossPercent >= 0 ? GREEN : RED }}>
                                    {p.gainLossPercent >= 0 ? '+' : ''}{p.gainLossPercent}%
                                </div>
                                <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                                    {p.gainLoss >= 0 ? '+' : ''}${p.gainLoss?.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No assets yet</div>
                    )}
                </TiltCard>
            </div>
        </div>
    );
};

export default Analytics;
