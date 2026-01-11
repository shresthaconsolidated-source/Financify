import React, { useState, useMemo } from 'react';
import { useWealth } from '../../context/WealthContext';
import { Plus, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, differenceInMonths } from 'date-fns';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardView = ({ onNavigate }) => {
    const { data } = useWealth();

    // Chart state
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [netWorthPeriod, setNetWorthPeriod] = useState('All');
    const [trendPeriod, setTrendPeriod] = useState('1Y');

    const totalNetWorth = data?.accounts.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

    // Calculate monthly stats
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTx = data?.transactions.filter(t => t.date.startsWith(currentMonth)) || [];
    const income = monthlyTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
    const expense = monthlyTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

    // Get available months from transactions
    const availableMonths = useMemo(() => {
        const months = new Set();
        data?.transactions.forEach(tx => {
            const monthKey = format(new Date(tx.date), 'yyyy-MM');
            months.add(monthKey);
        });
        return Array.from(months).sort().reverse();
    }, [data?.transactions]);

    // Pie chart data for selected month
    const monthlyPieData = useMemo(() => {
        const txForMonth = data?.transactions.filter(t => t.date.startsWith(selectedMonth)) || [];
        const monthIncome = txForMonth.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
        const monthExpense = txForMonth.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

        return [
            { name: 'Income', value: monthIncome, color: '#4ade80' },
            { name: 'Expenses', value: monthExpense, color: '#f87171' }
        ];
    }, [data?.transactions, selectedMonth]);

    // Helper: Calculate time-based filtering
    const getFilteredTransactions = (period) => {
        if (period === 'All') return data?.transactions || [];

        const now = new Date();
        const cutoff = period === '1Y' ? subMonths(now, 12) : period === '6M' ? subMonths(now, 6) : subMonths(now, 3);
        return data?.transactions.filter(t => new Date(t.date) >= cutoff) || [];
    };

    // Helper: Smart aggregation (monthly/quarterly/semi-annual based on range)
    const getAggregationPeriod = (transactions) => {
        if (!transactions || transactions.length === 0) return 'monthly';

        const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
        const months = differenceInMonths(dates[dates.length - 1], dates[0]);

        if (months <= 10) return 'monthly';
        if (months <= 40) return 'quarterly';
        return 'semiannual';
    };

    // Net Worth Growth Data
    const netWorthData = useMemo(() => {
        const transactions = getFilteredTransactions(netWorthPeriod).sort((a, b) => new Date(a.date) - new Date(b.date));
        if (!transactions || transactions.length === 0) return [];

        const aggregation = getAggregationPeriod(transactions);
        const dataPoints = new Map();

        transactions.forEach(tx => {
            const date = new Date(tx.date);
            let key;

            if (aggregation === 'monthly') {
                key = format(date, 'yyyy-MM');
            } else if (aggregation === 'quarterly') {
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                key = `${date.getFullYear()}-Q${quarter}`;
            } else {
                const half = date.getMonth() < 6 ? 'H1' : 'H2';
                key = `${date.getFullYear()}-${half}`;
            }

            if (!dataPoints.has(key)) {
                dataPoints.set(key, { label: key, transactions: [] });
            }
            dataPoints.get(key).transactions.push(tx);
        });

        let runningBalance = data?.accounts.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

        // Work backwards from present
        const sortedKeys = Array.from(dataPoints.keys()).sort().reverse();
        const result = [];

        sortedKeys.forEach(key => {
            result.unshift({ label: key, netWorth: runningBalance });
            const txs = dataPoints.get(key).transactions;
            txs.forEach(tx => {
                if (tx.type === 'INCOME') runningBalance -= Number(tx.amount);
                else if (tx.type === 'EXPENSE') runningBalance += Number(tx.amount);
            });
        });

        return result;
    }, [data?.transactions, data?.accounts, netWorthPeriod]);

    // Income/Expense Trend Data
    const trendData = useMemo(() => {
        const transactions = getFilteredTransactions(trendPeriod).sort((a, b) => new Date(a.date) - new Date(b.date));
        if (!transactions || transactions.length === 0) return [];

        const aggregation = getAggregationPeriod(transactions);
        const dataPoints = new Map();

        transactions.forEach(tx => {
            const date = new Date(tx.date);
            let key;

            if (aggregation === 'monthly') {
                key = format(date, 'yyyy-MM');
            } else if (aggregation === 'quarterly') {
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                key = `${date.getFullYear()}-Q${quarter}`;
            } else {
                const half = date.getMonth() < 6 ? 'H1' : 'H2';
                key = `${date.getFullYear()}-${half}`;
            }

            if (!dataPoints.has(key)) {
                dataPoints.set(key, { label: key, income: 0, expense: 0 });
            }

            if (tx.type === 'INCOME') {
                dataPoints.get(key).income += Number(tx.amount);
            } else if (tx.type === 'EXPENSE') {
                dataPoints.get(key).expense += Number(tx.amount);
            }
        });

        return Array.from(dataPoints.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [data?.transactions, trendPeriod]);

    return (
        <div style={{ padding: '1.5rem 1.25rem', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <div style={{
                            fontSize: '1.75rem',
                            fontWeight: 800,
                            marginBottom: '0.25rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Financify
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            fontWeight: 600,
                            letterSpacing: '0.05em'
                        }}>
                            v6.8.0
                        </div>
                    </div>
                    <div className="avatar">
                        {data?.user.name?.[0] || 'U'}
                    </div>
                </div>
                <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    marginBottom: '0.25rem'
                }}>
                    Welcome back,
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {data?.user.name || 'User'} 👋
                </div>
            </header>


            {/* Hero Balance Card + Quick Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="hero-card" style={{ flex: 1, padding: '1.25rem' }}>
                    <div style={{
                        fontSize: '0.6875rem',
                        opacity: 0.8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        marginBottom: '0.375rem'
                    }}>
                        Total Balance
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        lineHeight: 1,
                        marginBottom: '1rem',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.04em'
                    }}>
                        <span style={{ fontSize: '1.125rem', fontWeight: 600, marginRight: '0.25rem', opacity: 0.9 }}>
                            {data?.user.currency}
                        </span>
                        {totalNetWorth.toLocaleString()}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.25rem',
                                fontSize: '0.75rem',
                                opacity: 0.85
                            }}>
                                <div style={{
                                    width: '5px',
                                    height: '5px',
                                    background: '#4ade80',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 6px rgba(74, 222, 128, 0.6)'
                                }} />
                                Income
                            </div>
                            <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                                +{data?.user.currency}{income.toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.25rem',
                                fontSize: '0.75rem',
                                opacity: 0.85
                            }}>
                                <div style={{
                                    width: '5px',
                                    height: '5px',
                                    background: '#f87171',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 6px rgba(248, 113, 113, 0.6)'
                                }} />
                                Expenses
                            </div>
                            <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                                -{data?.user.currency}{expense.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        className="btn-primary"
                        onClick={() => onNavigate('transactions')}
                        style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
                    >
                        <Plus size={16} />
                        Add Transaction
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => onNavigate('goals')}
                        style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
                    >
                        <TrendingUp size={16} />
                        Set Goals
                    </button>
                </div>
            </div>

            {/* Bank & Cash Section */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <h3>Bank & Cash</h3>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {data.user.currency}{data.accounts.filter(a => a.type === 'BANK' || a.type === 'CASH').reduce((sum, a) => sum + Number(a.balance), 0).toLocaleString()}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {data?.accounts.filter(a => a.type === 'BANK' || a.type === 'CASH').map(acc => (
                        <div key={acc.id} className="glass-card" style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{
                                    fontSize: '1.125rem',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--bg-soft)',
                                    borderRadius: '8px'
                                }}>
                                    {acc.type === 'BANK' ? '🏦' : '💵'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.0625rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {acc.name}
                                    </div>
                                    <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {acc.type}
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                                {data.user.currency}{Number(acc.balance).toLocaleString()}
                            </div>
                        </div>
                    ))}
                    {data?.accounts.filter(a => a.type === 'BANK' || a.type === 'CASH').length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                            No bank or cash accounts yet
                        </div>
                    )}
                </div>
            </div>

            {/* Assets Section */}
            {data?.accounts.filter(a => a.type === 'ASSET').length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <h3>Assets</h3>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            {data.user.currency}{data.accounts.filter(a => a.type === 'ASSET').reduce((sum, a) => sum + Number(a.balance), 0).toLocaleString()}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {data.accounts.filter(a => a.type === 'ASSET').map(acc => (
                            <div key={acc.id} className="glass-card" style={{ padding: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{
                                        fontSize: '1.125rem',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
                                        borderRadius: '8px'
                                    }}>
                                        📈
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.0625rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {acc.name}
                                        </div>
                                        <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {acc.assetClass || 'Asset'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                                    {data.user.currency}{Number(acc.balance).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Financial Charts */}
            {data?.transactions.length > 0 && (
                <div>
                    <h3 style={{ marginBottom: '1.5rem' }}>Financial Insights</h3>

                    {/* Pie Chart - Monthly Income vs Expense */}
                    <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Income vs Expenses</h4>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="input"
                                style={{ width: 'auto', padding: '0.5rem', fontSize: '0.75rem' }}
                            >
                                {availableMonths.map(month => (
                                    <option key={month} value={month}>
                                        {format(new Date(month + '-01'), 'MMM yyyy')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={monthlyPieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={70}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {monthlyPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${data.user.currency}${value.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Net Worth Growth Chart */}
                    <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Net Worth Growth</h4>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['All', '1Y', '6M', '3M'].map(period => (
                                    <button
                                        key={period}
                                        onClick={() => setNetWorthPeriod(period)}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.6875rem',
                                            fontWeight: 600,
                                            background: netWorthPeriod === period ? 'var(--primary)' : 'var(--bg-soft)',
                                            color: netWorthPeriod === period ? '#fff' : 'var(--text-secondary)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={netWorthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--text-tertiary)" />
                                <YAxis tick={{ fontSize: 10 }} stroke="var(--text-tertiary)" tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip formatter={(value) => `${data.user.currency}${value.toLocaleString()}`} />
                                <Line type="monotone" dataKey="netWorth" stroke="#667eea" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Income/Expense Trend Chart */}
                    <div className="glass-card" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Income & Expense Trend</h4>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['All', '1Y', '6M', '3M'].map(period => (
                                    <button
                                        key={period}
                                        onClick={() => setTrendPeriod(period)}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.6875rem',
                                            fontWeight: 600,
                                            background: trendPeriod === period ? 'var(--primary)' : 'var(--bg-soft)',
                                            color: trendPeriod === period ? '#fff' : 'var(--text-secondary)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--text-tertiary)" />
                                <YAxis tick={{ fontSize: 10 }} stroke="var(--text-tertiary)" tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip formatter={(value) => `${data.user.currency}${value.toLocaleString()}`} />
                                <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};
