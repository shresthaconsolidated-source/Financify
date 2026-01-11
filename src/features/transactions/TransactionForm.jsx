import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { Check } from 'lucide-react';

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

    // Calculate position logic for the sliding pill
    const getIndicatorStyle = () => {
        // Assuming 3 tabs: 33.33% each
        if (type === 'EXPENSE') return { left: '4px', width: 'calc(33.33% - 8px)' };
        if (type === 'INCOME') return { left: '33.33%', width: '33.33%' };
        if (type === 'TRANSFER') return { left: 'calc(66.66% + 4px)', width: 'calc(33.33% - 8px)' };
        return {};
    };

    return (
        <div className="ios-card fade-in" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>New Transaction</h2>

            {/* Premium Tabs */}
            <div className="segmented-control">
                <div className="segment-indicator" style={getIndicatorStyle()}></div>

                <button
                    type="button"
                    className={`segment-btn ${type === 'EXPENSE' ? 'active' : ''}`}
                    onClick={() => setType('EXPENSE')}
                >
                    Expense
                </button>
                <button
                    type="button"
                    className={`segment-btn ${type === 'INCOME' ? 'active' : ''}`}
                    onClick={() => setType('INCOME')}
                >
                    Income
                </button>
                <button
                    type="button"
                    className={`segment-btn ${type === 'TRANSFER' ? 'active' : ''}`}
                    onClick={() => setType('TRANSFER')}
                >
                    Transfer
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Amount Hero Input */}
                <div>
                    <label>ENTER AMOUNT</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)',
                            fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '600'
                        }}>
                            {data.user.currency}
                        </span>
                        <input
                            type="number"
                            className="input"
                            style={{ paddingLeft: '3.5rem', fontSize: '1.5rem', height: '60px' }}
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                            autoFocus
                            required
                        />
                    </div>
                </div>

                {/* Account & Category Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label>{type === 'INCOME' ? 'DEPOSIT TO' : 'PAY FROM'}</label>
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
                            <label>TRANSFER TO</label>
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
                            <label>CATEGORY</label>
                            <select
                                className="input"
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {(type === 'INCOME' ? incomeCategories : expenseCategories).map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Date & Note Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label>DATE</label>
                        <input
                            type="date"
                            className="input"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>NOTE</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                            placeholder="What's this for?"
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', boxShadow: '0 0 30px var(--primary-dim)' }}>
                    Save Transaction
                </button>
            </form>
        </div>
    );
};
