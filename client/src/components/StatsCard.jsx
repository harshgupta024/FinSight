/**
 * StatsCard — Gold-themed stat card (used by Dashboard for backward compat)
 */
const StatsCard = ({ title, value, icon, trend, trendValue, className = '' }) => (
    <div className={`stats-card p-5 page-enter ${className}`}>
        <div className="flex items-center justify-between mb-3">
            <span className="section-label">{title}</span>
            <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>{icon}</span>
        </div>
        <div className="text-xl font-bold number-animate" style={{ color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
            {value}
        </div>
        {trend && (
            <div className="mt-2">
                <span className={`badge ${trend === 'up' ? 'badge-success' : 'badge-danger'}`}>
                    {trend === 'up' ? '▲' : '▼'} {trendValue}
                </span>
            </div>
        )}
    </div>
);

export default StatsCard;
