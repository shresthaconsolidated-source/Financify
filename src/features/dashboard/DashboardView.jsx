import React from 'react';
import { useWealth } from '../../context/WealthContext';
import { Plus, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export const DashboardView = ({ onNavigate }) => {
    const { data } = useWealth();

    const totalNetWorth = data?.accounts.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

    // Calculate monthly stats
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTx = data?.transactions.filter(t => t.date.startsWith(currentMonth)) || [];
    const income = monthlyTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
    const expense = monthlyTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

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
                            v6.7.1
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
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}
                        >
                            View All
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {data.transactions.slice(0, 4).map(tx => {
                            const category = data.categories.find(c => c.id === tx.categoryId);
                            const account = data.accounts.find(a => a.id === tx.accountId);

                            return (
                                <div key={tx.id} className="list-item">
                                    <div style={{
                                        fontSize: '1.75rem',
                                        width: '56px',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: tx.type === 'INCOME'
                                            ? 'rgba(16, 185, 129, 0.08)'
                                            : 'rgba(239, 68, 68, 0.08)',
                                        borderRadius: '14px'
                                    }}>
                                        {category?.icon || '💸'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>
                                            {category?.name || 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                            {account?.name} • {format(new Date(tx.date), 'MMM d')}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: 700,
                                        fontSize: '1.0625rem',
                                        color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--text-primary)',
                                        fontVariantNumeric: 'tabular-nums'
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
