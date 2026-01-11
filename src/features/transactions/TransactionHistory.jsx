import React from 'react';
import { useWealth } from '../../context/WealthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { Trash2 } from 'lucide-react';

export const TransactionHistory = () => {
    const { data, deleteTransaction } = useWealth();

    const sortedTx = [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const getAccountName = (id) => data.accounts.find(a => a.id === id)?.name || 'Unknown';
    const getCategory = (id) => data.categories.find(c => c.id === id);

    if (sortedTx.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: 'var(--text-tertiary)'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    No transactions yet
                </div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Add your first transaction to get started
                </div>
            </div>
        );
    }

    // Group by Date
    const grouped = sortedTx.reduce((acc, tx) => {
        const date = tx.date.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(tx);
        return acc;
    }, {});

    return (
        <div className="fade-in">
            {Object.keys(grouped).map(dateStr => {
                const date = new Date(dateStr);
                let label = format(date, 'MMMM d, yyyy');
                if (isToday(date)) label = 'Today';
                if (isYesterday(date)) label = 'Yesterday';

                return (
                    <div key={dateStr} style={{ marginBottom: '2rem' }}>
                        <h4 style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.75rem',
                            paddingLeft: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 700
                        }}>
                            {label}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {grouped[dateStr].map((tx) => {
                                const category = getCategory(tx.categoryId);
                                const isExpense = tx.type === 'EXPENSE';
                                const isIncome = tx.type === 'INCOME';
                                const isTransfer = tx.type === 'TRANSFER';

                                return (
                                    <div key={tx.id} className="list-item">
                                        <div style={{
                                            fontSize: '1.75rem',
                                            width: '56px',
                                            height: '56px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isIncome
                                                ? 'rgba(16, 185, 129, 0.08)'
                                                : isExpense
                                                    ? 'rgba(239, 68, 68, 0.08)'
                                                    : 'rgba(102, 126, 234, 0.08)',
                                            borderRadius: '14px'
                                        }}>
                                            {isTransfer ? '🔄' : (category?.icon || '💸')}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>
                                                {isTransfer ? `Transfer to ${getAccountName(tx.toAccountId)}` : (category?.name || 'Uncategorized')}
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                                {tx.note || getAccountName(tx.accountId)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                fontWeight: 700,
                                                fontSize: '1.0625rem',
                                                color: isIncome ? 'var(--success)' : 'var(--text-primary)',
                                                fontVariantNumeric: 'tabular-nums'
                                            }}>
                                                {isIncome && '+'}{isExpense && '-'}{data.user.currency}{Number(tx.amount).toLocaleString()}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this transaction? This will update your account balance.')) {
                                                        deleteTransaction(tx.id);
                                                    }
                                                }}
                                                style={{
                                                    background: 'var(--danger-bg)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '0.5rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Trash2 size={14} color="var(--danger)" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
