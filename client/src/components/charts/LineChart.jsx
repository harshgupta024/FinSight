/**
 * Price Line Chart — Gold-themed
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

const PriceLineChart = ({ data }) => {
    const { isDark } = useTheme();

    const goldColor = isDark ? '#d4af37' : '#b8960f';
    const gridColor = isDark ? 'rgba(212, 175, 55, 0.06)' : 'rgba(184, 150, 15, 0.08)';
    const textColor = isDark ? '#64748b' : '#94a3b8';
    const tooltipBg = isDark ? 'rgba(10, 12, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipBorder = isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 150, 15, 0.15)';
    const tooltipText = isDark ? '#f1f5f9' : '#0f172a';

    return (
        <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
                <defs>
                    <linearGradient id="goldLineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={goldColor} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={goldColor} stopOpacity={0} />
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
                    cursor={{ stroke: goldColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                    type="monotone"
                    dataKey="price"
                    stroke="none"
                    fill="url(#goldLineGradient)"
                />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke={goldColor}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: goldColor, strokeWidth: 2, stroke: isDark ? '#0a0c14' : '#faf9f6' }}
                    activeDot={{ r: 6, strokeWidth: 3, stroke: goldColor, fill: isDark ? '#0a0c14' : '#faf9f6' }}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PriceLineChart;
