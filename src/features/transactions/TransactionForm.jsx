import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';

export const TransactionForm = ({ onSuccess }) => {
    const { data, addTransaction } = useWealth();
    const [type, setType] = useState('EXPENSE');
    const [formData, setFormData] = useState({
        amount: '',
        accountId: data.accounts[0]?.id || '',
        toAccountId: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.accountId) return;
        addTransaction({
            ...formData,
            amount: Number(formData.amount),
            type,
            date: new Date(formData.date).toISOString()
        });
        setFormData({
            amount: '',
            accountId: data.accounts[0]?.id || '',
            toAccountId: '',
            categoryId: '',
            date: new Date().toISOString().split('T')[0],
            note: ''
        });
        if (onSuccess) onSuccess();
    };

    const incomeCategories = data.categories.filter(c => c.type === 'INCOME');
    const expenseCategories = data.categories.filter(c => c.type === 'EXPENSE');

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontWeight: 700 }}>New Transaction</h3>

            {/* Type Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2rem',
                padding: '0.25rem',
                background: 'var(--bg-soft)',
                borderRadius: 'var(--radius-md)'
            }}>
                {['EXPENSE', 'INCOME', 'TRANSFER'].map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: type === t ? 'white' : 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: type === t ? 700 : 500,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            color: type === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: type === t ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {t === 'EXPENSE' ? '💸 Expense' : t === 'INCOME' ? '💰 Income' : '🔄 Transfer'}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Amount */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem'
                    }}>
                        Enter Amount
                    </label>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute',
                            left: '1.25rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1.5rem',
                            color: 'var(--text-tertiary)',
                            fontWeight: 600
                        }}>
                            {data.user.currency}
                        </span>
                        <input
                            type="number"
                            step="0.01"
                            className="input"
                            style={{
                                paddingLeft: '3.5rem',
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                height: '70px'
                            }}
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                            autoFocus
                            required
                        />
                    </div>
                </div>

                {/* Account & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem'
                        }}>
                            {type === 'INCOME' ? 'Deposit To' : 'Pay From'}
                        </label>
                        <select
                            className="input"
                            value={formData.accountId}
                            onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                            required
                        >
                            <option value="">Select Account</option>
                            {data.accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    {type === 'TRANSFER' ? (
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--text-secondary)',
                                marginBottom: '0.5rem'
                            }}>
                                Transfer To
                            </label>
                            <select
                                className="input"
                                value={formData.toAccountId}
                                onChange={e => setFormData({ ...formData, toAccountId: e.target.value })}
                                required
                            >
                                <option value="">Select Account</option>
                                {data.accounts.filter(a => a.id !== formData.accountId).map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--text-secondary)',
                                marginBottom: '0.5rem'
                            }}>
                                Category
                            </label>
                            <select
                                className="input"
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {(type === 'INCOME' ? incomeCategories : expenseCategories).map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Date & Note */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem'
                        }}>
                            Date
                        </label>
                        <input
                            type="date"
                            className="input"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem'
                        }}>
                            Note
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                            placeholder="What's this for?"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    style={{
                        marginTop: '1rem',
                        padding: '1.125rem',
                        fontSize: '1rem',
                        fontWeight: 700
                    }}
                >
                    Save Transaction
                </button>
            </form>
        </div>
    );
};
