/**
 * StatsCard – Theme-aware animated stats card
 */
const StatsCard = ({ title, value, icon, trend, trendValue, className = '' }) => {
    const isPositive = trend === 'up';

    return (
        <div className={`stats-card p-5 ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{title}</span>
                <span className="text-xl">{icon}</span>
            </div>
            <div className="text-2xl font-bold number-animate" style={{ color: 'var(--text-primary)' }}>
                {value}
            </div>
            {trendValue && (
                <div className="flex items-center gap-1 mt-2">
                    <span className={`badge ${isPositive ? 'badge-success' : 'badge-danger'}`}>
                        {isPositive ? '▲' : '▼'} {trendValue}
                    </span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
