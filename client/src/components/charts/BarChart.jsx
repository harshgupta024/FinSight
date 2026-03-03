/**
 * Volume Bar Chart — Gold-themed
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

const VolumeBarChart = ({ data }) => {
    const { isDark } = useTheme();

    const goldColor = isDark ? '#d4af37' : '#b8960f';
    const gridColor = isDark ? 'rgba(212, 175, 55, 0.06)' : 'rgba(184, 150, 15, 0.08)';
    const textColor = isDark ? '#64748b' : '#94a3b8';
    const tooltipBg = isDark ? 'rgba(10, 12, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipBorder = isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 150, 15, 0.15)';
    const tooltipText = isDark ? '#f1f5f9' : '#0f172a';

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
                <defs>
                    <linearGradient id="goldBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={goldColor} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={goldColor} stopOpacity={0.3} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                    dataKey="name"
                    tick={{ fill: textColor, fontSize: 11, fontFamily: "'Space Mono', monospace" }}
                    axisLine={{ stroke: gridColor }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: textColor, fontSize: 11, fontFamily: "'Space Mono', monospace" }}
                    axisLine={{ stroke: gridColor }}
                    tickLine={false}
                />
                <Tooltip
                    contentStyle={{
                        background: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '12px',
                        color: tooltipText,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(12px)',
                        fontFamily: "'DM Sans', sans-serif",
                    }}
                    cursor={{ fill: isDark ? 'rgba(212, 175, 55, 0.05)' : 'rgba(184, 150, 15, 0.05)' }}
                    formatter={(value) => [`${value.toFixed(2)}B`, 'Volume']}
                />
                <Bar
                    dataKey="volume"
                    fill="url(#goldBarGradient)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default VolumeBarChart;
