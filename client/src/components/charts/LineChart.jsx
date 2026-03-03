/**
 * Price Line Chart – Theme-aware
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

const PriceLineChart = ({ data }) => {
    const { isDark } = useTheme();

    const colors = {
        stroke: isDark ? '#818cf8' : '#6366f1',
        grid: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.1)',
        text: isDark ? '#64748b' : '#94a3b8',
        tooltipBg: isDark ? '#1e293b' : '#ffffff',
        tooltipBorder: isDark ? '#334155' : '#e2e8f0',
        tooltipText: isDark ? '#f1f5f9' : '#0f172a',
    };

    return (
        <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
                <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.stroke} stopOpacity={0} />
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
                />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke={colors.stroke}
                    strokeWidth={3}
                    dot={{ r: 5, fill: colors.stroke, strokeWidth: 2, stroke: colors.tooltipBg }}
                    activeDot={{ r: 7, strokeWidth: 3, stroke: colors.stroke, fill: colors.tooltipBg }}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PriceLineChart;
