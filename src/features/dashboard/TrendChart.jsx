import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useWealth } from '../../context/WealthContext';
import { startOfMonth, subMonths, format, endOfMonth, isWithinInterval } from 'date-fns';

export const TrendChart = () => {
    const { data } = useWealth();

    // Logic repeated for chart generation
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    const chartData = months.map(date => {
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const monthlyTx = data.transactions.filter(tx =>
            isWithinInterval(new Date(tx.date), { start: monthStart, end: monthEnd })
        );
        const income = monthlyTx.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = monthlyTx.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
        return { name: format(date, 'MMM'), net: income - expense };
    });

    let currentNetWorth = data.accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const netWorthData = [];
    let runningNetWorth = currentNetWorth;
    for (let i = chartData.length - 1; i >= 0; i--) {
        netWorthData.unshift({ name: chartData[i].name, value: runningNetWorth });
        runningNetWorth = runningNetWorth - chartData[i].net;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netWorthData}>
                <defs>
                    <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    dy={10}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#18181b',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        color: '#f4f4f5'
                    }}
                    cursor={{ stroke: '#27272a', strokeWidth: 1 }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#gradientGreen)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
