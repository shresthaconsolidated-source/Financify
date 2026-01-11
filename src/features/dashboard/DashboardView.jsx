import React from 'react';
import { useWealth } from '../../context/WealthContext';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

export const DashboardView = ({ onNavigate }) => {
    const { data } = useWealth();

    const totalNetWorth = data?.accounts.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

    // Calculate monthly stats
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTx = data?.transactions.filter(t => t.date.startsWith(currentMonth)) || [];
    const income = monthlyTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
    const expense = monthlyTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
    const balance = income - expense;

    return (
        <div style={{ padding: '1.5rem 1.25rem' }}>
            {/* Header */}
            <header style={{ marginBottom: '2rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                }}>
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                            marginBottom: '0.25rem'
                        }}>
                            Total Balance
                        </div>
                        <h1 style={{ fontSize: '2.5rem' }}>
                            <span style={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                marginRight: '0.25rem'
                            }}>
                                {data?.user.currency}
                            </span>
                            {totalNetWorth.toLocaleString()}
                        </h1>
                    </div>
                    <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}>
                        {data?.user.name?.[0] || 'U'}
                    </div>
                </div>
            </header>

            {/* Monthly Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.5rem'
            }}>
                <div className="glass-card" style={{ padding: '1rem', margin: 0 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                    }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'var(--success-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingUp size={16} color="var(--success)" />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            Income
                        </span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {data?.user.currency}{income.toLocaleString()}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1rem', margin: 0 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                    }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'var(--danger-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingDown size={16} color="var(--danger)" />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            Expenses
                        </span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {data?.user.currency}{expense.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Quick Action */}
            <button
                className="btn-primary"
                onClick={() => onNavigate('transactions')}
                style={{
                    width: '100%',
                    marginBottom: '2rem',
                    padding: '1rem',
                    fontSize: '1rem'
                }}
            >
                <Plus size={20} />
                Add Transaction
            </button>

            {/* Accounts Section */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <h3>Accounts</h3>
                    <button
                        onClick={() => onNavigate('settings')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        See All
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {data?.accounts.slice(0, 5).map(acc => (
                        <div key={acc.id} className="list-item">
                            <div style={{
                                fontSize: '1.5rem',
                                width: '48px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--bg-soft)',
                                borderRadius: '12px'
                            }}>
                                {acc.type === 'BANK' ? '🏦' : acc.type === 'CASH' ? '💵' : '📈'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>
                                    {acc.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {acc.assetClass || acc.type}
                                </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                                {data.user.currency}{Number(acc.balance).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            {data?.transactions.length > 0 && (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <h3>Recent Activity</h3>
                        <button
                            onClick={() => onNavigate('transactions')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            View All
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {data.transactions.slice(0, 5).map(tx => {
                            const category = data.categories.find(c => c.id === tx.categoryId);
                            const account = data.accounts.find(a => a.id === tx.accountId);

                            return (
                                <div key={tx.id} className="list-item">
                                    <div style={{
                                        fontSize: '1.5rem',
                                        width: '48px',
                                        height: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--bg-soft)',
                                        borderRadius: '12px'
                                    }}>
                                        {category?.icon || '💸'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>
                                            {category?.name || 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {account?.name} • {format(new Date(tx.date), 'MMM d')}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--text-primary)'
                                    }}>
                                        {tx.type === 'INCOME' ? '+' : '-'}{data.user.currency}{Number(tx.amount).toLocaleString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
