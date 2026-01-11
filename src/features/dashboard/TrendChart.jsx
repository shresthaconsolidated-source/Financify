import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const TrendChart = ({ data }) => {
    // If no data, show a flat line or empty state
    const chartData = data && data.length > 0 ? data : [
        { date: 'Mon', amount: 0 },
        { date: 'Tue', amount: 0 },
        { date: 'Wed', amount: 0 },
        { date: 'Thu', amount: 0 },
        { date: 'Fri', amount: 0 },
        { date: 'Sat', amount: 0 },
        { date: 'Sun', amount: 0 },
    ];

    return (
        <div className="ios-card" style={{ height: '300px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-main)' }}>Weekly Activity</h3>
            <div style={{ flex: 1, width: '100%', marginLeft: '-12px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#E5E5EA" strokeDasharray="4 4" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#86868B', fontSize: 11, dy: 10 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1D1D1F',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#FFFFFF',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                            }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: '#000000', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#000000"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
