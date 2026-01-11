import React from 'react';
import { useWealth } from '../../context/WealthContext';
import { format, isToday, isYesterday } from 'date-fns';

export const TransactionHistory = () => {
    const { data } = useWealth();

    const sortedTx = [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const getAccountName = (id) => data.accounts.find(a => a.id === id)?.name || 'Unknown';
    const getCategory = (id) => data.categories.find(c => c.id === id);

    if (sortedTx.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No transactions yet.</div>;
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
                    <div key={dateStr} style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</h3>
                        <div className="ios-card" style={{ padding: '0' }}>
                            {grouped[dateStr].map((tx, idx) => {
                                const category = getCategory(tx.categoryId);
                                const isExpense = tx.type === 'EXPENSE';
                                const isIncome = tx.type === 'INCOME';
                                const isTransfer = tx.type === 'TRANSFER';

                                return (
                                    <div key={tx.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '1rem',
                                        borderBottom: idx === grouped[dateStr].length - 1 ? 'none' : '1px solid var(--border-subtle)'
                                    }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-subtle)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                                            }}>
                                                {isTransfer ? 'arrows_left_right_icon' : (category?.icon || '•')}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>
                                                    {isTransfer ? `Transfer to ${getAccountName(tx.toAccountId)}` : (category?.name || 'Uncategorized')}
                                                </span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                    {tx.note || getAccountName(tx.accountId)}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '600', color: isIncome ? 'var(--primary)' : 'var(--text-main)' }}>
                                            {isExpense ? '' : (isIncome ? '+' : '')}
                                            {Number(tx.amount).toLocaleString()}
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
