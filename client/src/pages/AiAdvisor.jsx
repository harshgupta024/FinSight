/**
 * AI Advisor Page — Gold-themed with SSE streaming, metrics dashboard, history
 */
import { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import TiltCard from '../components/TiltCard';
import api from '../services/api';

const RISK_COLORS = {
    low: '#30d158',
    medium: '#d4af37',
    high: '#ff9f0a',
    very_high: '#ff453a',
};

const RISK_LABELS = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    very_high: 'Very High',
};

/* ── Risk Gauge SVG ── */
const RiskGauge = ({ level = 'low', size = 140 }) => {
    const levels = ['low', 'medium', 'high', 'very_high'];
    const idx = levels.indexOf(level);
    const angle = -90 + ((idx + 0.5) / levels.length) * 180;
    const color = RISK_COLORS[level] || RISK_COLORS.low;
    const r = size / 2 - 12;

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
                {/* Background arc segments */}
                {levels.map((l, i) => {
                    const startAngle = -180 + (i / levels.length) * 180;
                    const endAngle = -180 + ((i + 1) / levels.length) * 180;
                    const x1 = size / 2 + r * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = size / 2 + r * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = size / 2 + r * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = size / 2 + r * Math.sin((endAngle * Math.PI) / 180);
                    return (
                        <path
                            key={l}
                            d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                            fill="none"
                            stroke={RISK_COLORS[l]}
                            strokeWidth={8}
                            strokeLinecap="round"
                            opacity={i <= idx ? 1 : 0.2}
                        />
                    );
                })}
                {/* Needle */}
                <line
                    x1={size / 2}
                    y1={size / 2}
                    x2={size / 2 + (r - 18) * Math.cos((angle * Math.PI) / 180)}
                    y2={size / 2 + (r - 18) * Math.sin((angle * Math.PI) / 180)}
                    stroke={color}
                    strokeWidth={3}
                    strokeLinecap="round"
                />
                <circle cx={size / 2} cy={size / 2} r={5} fill={color} />
            </svg>
            <span className="text-sm font-semibold" style={{ color }}>{RISK_LABELS[level]}</span>
        </div>
    );
};

/* ── Metric Card ── */
const MetricCard = ({ label, value, subtext, color }) => (
    <div className="text-center p-4">
        <div className="section-label mb-1">{label}</div>
        <div className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif", color: color || 'var(--text-primary)' }}>
            {value}
        </div>
        {subtext && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subtext}</div>}
    </div>
);

/* ── Main Page ── */
const AiAdvisor = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [analysisText, setAnalysisText] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const textRef = useRef(null);

    // Fetch history
    const { data: historyData, refetch: refetchHistory } = useQuery({
        queryKey: ['ai', 'history'],
        queryFn: async () => {
            const { data } = await api.get('/ai/history');
            return data?.data || [];
        },
        staleTime: 60_000,
    });
    const history = historyData || [];

    // Start analysis (SSE streaming)
    const startAnalysis = useCallback(async () => {
        setAnalyzing(true);
        setMetrics(null);
        setAnalysisText('');

        try {
            const token = localStorage.getItem('finsight_token');
            const baseUrl = window.location.origin;
            const response = await fetch(`${baseUrl}/api/ai/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ type: 'portfolio_review' }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Analysis failed');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event = JSON.parse(line.slice(6));
                            if (event.type === 'metrics') {
                                setMetrics(event.metrics);
                            } else if (event.type === 'text') {
                                setAnalysisText((prev) => prev + event.content);
                            } else if (event.type === 'done') {
                                refetchHistory();
                            } else if (event.type === 'error') {
                                toast.error(event.message);
                            }
                        } catch { /* skip malformed JSON */ }
                    }
                }
            }

            toast.success('Analysis complete!');
        } catch (err) {
            toast.error(err.message || 'Failed to analyze portfolio');
        } finally {
            setAnalyzing(false);
        }
    }, [refetchHistory]);

    // Auto-scroll analysis text
    const scrollToBottom = () => {
        if (textRef.current) {
            textRef.current.scrollTop = textRef.current.scrollHeight;
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (analysisText) setTimeout(scrollToBottom, 50);

    return (
        <div className="page-enter space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between fade-slide-up">
                <div>
                    <h1 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--text-primary)' }}>
                        <span className="text-gradient">AI Portfolio Advisor</span>
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Get AI-powered analysis and recommendations
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-sm px-4 py-2 rounded-xl ripple"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    >
                        {showHistory ? '◈ Analysis' : '◷ History'}
                    </button>
                    <button
                        onClick={startAnalysis}
                        disabled={analyzing}
                        className="btn-primary ripple text-sm"
                    >
                        {analyzing ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Analyzing…
                            </span>
                        ) : '◈ Analyze Portfolio'}
                    </button>
                </div>
            </div>

            {showHistory ? (
                /* ── History View ── */
                <TiltCard className="overflow-hidden fade-slide-up">
                    <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>
                            Analysis History
                        </h3>
                    </div>
                    {history.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-4xl mb-3" style={{ color: 'var(--gold)' }}>◈</div>
                            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No analyses yet</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Run your first analysis to see results here</p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                            {history.map((item, i) => (
                                <div key={item._id} className="p-4 flex items-center justify-between fade-slide-up"
                                    style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
                                            ◈
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {item.type?.replace(/_/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </div>
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {new Date(item.createdAt).toLocaleDateString()} · {new Date(item.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                                                ${item.metrics?.totalValue?.toLocaleString() || '—'}
                                            </div>
                                            <div className="text-xs" style={{
                                                color: (item.metrics?.pnlPercent || 0) >= 0 ? 'var(--success)' : 'var(--danger)',
                                            }}>
                                                {(item.metrics?.pnlPercent || 0) >= 0 ? '▲' : '▼'} {item.metrics?.pnlPercent?.toFixed(2) || 0}%
                                            </div>
                                        </div>
                                        <span className="badge" style={{
                                            background: `${RISK_COLORS[item.metrics?.riskLevel || 'low']}20`,
                                            color: RISK_COLORS[item.metrics?.riskLevel || 'low'],
                                        }}>
                                            {RISK_LABELS[item.metrics?.riskLevel || 'low']}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TiltCard>
            ) : (
                <>
                    {/* ── Metrics Dashboard ── */}
                    {metrics && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 fade-slide-up" style={{ animationDelay: '0.08s' }}>
                            {/* Risk Gauge */}
                            <TiltCard className="p-6 flex flex-col items-center justify-center">
                                <RiskGauge level={metrics.riskLevel} />
                            </TiltCard>

                            {/* Key Metrics */}
                            <TiltCard className="p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <MetricCard label="Sharpe Ratio" value={metrics.sharpeRatio} subtext="Risk-adjusted return" color={metrics.sharpeRatio > 1 ? '#30d158' : 'var(--gold)'} />
                                    <MetricCard label="Beta" value={metrics.beta} subtext="Market correlation" />
                                    <MetricCard label="Volatility" value={`${metrics.volatility}%`} subtext="Price variability" color={metrics.volatility > 40 ? '#ff453a' : 'var(--gold)'} />
                                    <MetricCard label="Max Drawdown" value={`${metrics.maxDrawdown}%`} subtext="Largest decline" color="#ff9f0a" />
                                </div>
                            </TiltCard>

                            {/* Portfolio Overview */}
                            <TiltCard className="p-4">
                                <div className="grid grid-cols-1 gap-2">
                                    <MetricCard
                                        label="Total Value"
                                        value={`$${metrics.totalValue?.toLocaleString()}`}
                                        color="var(--gold)"
                                    />
                                    <MetricCard
                                        label="P&L"
                                        value={`${metrics.pnl >= 0 ? '+' : ''}$${metrics.pnl?.toLocaleString()}`}
                                        subtext={`${metrics.pnlPercent >= 0 ? '+' : ''}${metrics.pnlPercent?.toFixed(2)}%`}
                                        color={metrics.pnl >= 0 ? '#30d158' : '#ff453a'}
                                    />
                                    <div className="flex items-center justify-center gap-6 mt-2">
                                        <div className="text-center">
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Diversification</div>
                                            <div className="text-lg font-bold" style={{ color: 'var(--gold)' }}>{metrics.diversificationScore}/100</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Top</div>
                                            <div className="text-sm font-mono font-semibold" style={{ color: '#30d158' }}>{metrics.topPerformer}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Worst</div>
                                            <div className="text-sm font-mono font-semibold" style={{ color: '#ff453a' }}>{metrics.worstPerformer}</div>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </div>
                    )}

                    {/* ── Analysis Text (streaming) ── */}
                    {(analysisText || analyzing) && (
                        <TiltCard className="fade-slide-up" style={{ animationDelay: '0.16s' }}>
                            <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2">
                                    {analyzing && (
                                        <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--gold)' }} />
                                    )}
                                    <h3 className="font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>
                                        {analyzing ? 'Analyzing your portfolio…' : 'Analysis Complete'}
                                    </h3>
                                </div>
                            </div>
                            <div
                                ref={textRef}
                                className="p-6 prose-custom overflow-y-auto"
                                style={{
                                    maxHeight: '500px',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.8,
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '0.9rem',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {analysisText || (
                                    <div className="flex items-center gap-3">
                                        <div className="spinner" style={{ width: 24, height: 24 }} />
                                        <span style={{ color: 'var(--text-muted)' }}>Generating analysis…</span>
                                    </div>
                                )}
                                {analyzing && analysisText && (
                                    <span className="inline-block w-2 h-4 ml-1 animate-pulse" style={{ background: 'var(--gold)' }} />
                                )}
                            </div>
                        </TiltCard>
                    )}

                    {/* ── Empty State ── */}
                    {!metrics && !analyzing && !analysisText && (
                        <TiltCard className="p-16 text-center fade-slide-up">
                            <div className="text-5xl mb-4" style={{ color: 'var(--gold)' }}>◈</div>
                            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>
                                AI-Powered Portfolio Intelligence
                            </h3>
                            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                                Get comprehensive analysis of your portfolio including risk assessment,
                                Sharpe ratio, diversification score, and actionable recommendations.
                            </p>
                            <button onClick={startAnalysis} className="btn-primary ripple">
                                ◈ Analyze My Portfolio
                            </button>
                        </TiltCard>
                    )}
                </>
            )}
        </div>
    );
};

export default AiAdvisor;
