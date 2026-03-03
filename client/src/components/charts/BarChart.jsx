/**
 * Volume Bar Chart – Theme-aware
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

const VolumeBarChart = ({ data }) => {
    const { isDark } = useTheme();

    const colors = {
        bar: isDark ? '#818cf8' : '#6366f1',
        barHover: isDark ? '#a78bfa' : '#4f46e5',
        grid: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.1)',
        text: isDark ? '#64748b' : '#94a3b8',
        tooltipBg: isDark ? '#1e293b' : '#ffffff',
        tooltipBorder: isDark ? '#334155' : '#e2e8f0',
        tooltipText: isDark ? '#f1f5f9' : '#0f172a',
    };

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.bar} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={colors.bar} stopOpacity={0.4} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="name" tick={{ fill: colors.text, fontSize: 12 }} axisLine={{ stroke: colors.grid }} />
                <YAxis tick={{ fill: colors.text, fontSize: 12 }} axisLine={{ stroke: colors.grid }} />
                <Tooltip
                    contentStyle={{
                        background: colors.tooltipBg,
                        border: `1px solid ${colors.tooltipBorder}`,
                        borderRadius: '12px',
                        color: colors.tooltipText,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    }}
                    formatter={(value) => [`${value.toFixed(2)}B`, 'Volume']}
                />
                <Bar
                    dataKey="volume"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default VolumeBarChart;
