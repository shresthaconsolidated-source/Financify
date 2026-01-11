import React, { useState, useMemo } from 'react';
import { useWealth } from '../../context/WealthContext';
import { format } from 'date-fns';
import { Trash2, Search, X } from 'lucide-react';

export const TransactionHistory = () => {
    const { data, deleteTransaction } = useWealth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterAccount, setFilterAccount] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const sortedTx = [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const getAccountName = (id) => data.accounts.find(a => a.id === id)?.name || 'Unknown';
    const getCategory = (id) => data.categories.find(c => c.id === id);

    // Get unique months for filter
    const availableMonths = useMemo(() => {
        const months = new Set();
        sortedTx.forEach(tx => {
            const monthKey = format(new Date(tx.date), 'yyyy-MM');
            months.add(monthKey);
        });
        return Array.from(months).sort().reverse();
    }, [sortedTx]);

    // Filtered transactions
    const filteredTx = useMemo(() => {
        return sortedTx.filter(tx => {
            // Search filter
            if (searchTerm) {
                const category = getCategory(tx.categoryId);
                const account = getAccountName(tx.accountId);
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch =
                    (category?.name || '').toLowerCase().includes(searchLower) ||
                    (tx.note || '').toLowerCase().includes(searchLower) ||
                    account.toLowerCase().includes(searchLower) ||
                    tx.amount.toString().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Month filter
            if (filterMonth) {
                const txMonth = format(new Date(tx.date), 'yyyy-MM');
                if (txMonth !== filterMonth) return false;
            }

            // Type filter
            if (filterType && tx.type !== filterType) return false;

            // Account filter
            if (filterAccount && tx.accountId !== filterAccount) return false;

            return true;
        });
    }, [sortedTx, searchTerm, filterMonth, filterType, filterAccount]);

    const handleSelectAll = () => {
        if (selectedIds.length === filteredTx.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTx.map(tx => tx.id));
        }
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`Delete ${selectedIds.length} selected transactions? This will update account balances.`)) {
            selectedIds.forEach(id => deleteTransaction(id));
            setSelectedIds([]);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterMonth('');
        setFilterType('');
        setFilterAccount('');
    };

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

    return (
        <div className="fade-in">
            {/* Filters */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '3rem' }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem'
                            }}
                        >
                            <X size={16} color="var(--text-secondary)" />
                        </button>
                    )}
                </div>

                {/* Filter Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <select
                        className="input"
                        value={filterMonth}
                        onChange={e => setFilterMonth(e.target.value)}
                    >
                        <option value="">All Months</option>
                        {availableMonths.map(month => (
                            <option key={month} value={month}>{format(new Date(month + '-01'), 'MMM yyyy')}</option>
                        ))}
                    </select>

                    <select
                        className="input"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                        <option value="TRANSFER">Transfer</option>
                    </select>

                    <select
                        className="input"
                        value={filterAccount}
                        onChange={e => setFilterAccount(e.target.value)}
                    >
                        <option value="">All Accounts</option>
                        {data.accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>

                {/* Active Filters & Actions */}
                {(searchTerm || filterMonth || filterType || filterAccount) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Showing {filteredTx.length} of {sortedTx.length} transactions
                        </div>
                        <button
                            className="btn-secondary"
                            onClick={clearFilters}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Selection Actions */}
            {selectedIds.length > 0 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'var(--bg-soft)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem'
                }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {selectedIds.length} selected
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => setSelectedIds([])}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            Deselect All
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleDeleteSelected}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                background: 'var(--danger)',
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}
                        >
                            <Trash2 size={14} />
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredTx.length && filteredTx.length > 0}
                                        onChange={handleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Date</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Category</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Account</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Note</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Amount</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTx.map((tx, idx) => {
                                const category = getCategory(tx.categoryId);
                                const isExpense = tx.type === 'EXPENSE';
                                const isIncome = tx.type === 'INCOME';
                                const isTransfer = tx.type === 'TRANSFER';

                                return (
                                    <tr
                                        key={tx.id}
                                        style={{
                                            borderBottom: idx === filteredTx.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                                            background: selectedIds.includes(tx.id) ? 'var(--bg-soft)' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(tx.id)}
                                                onChange={() => {
                                                    if (selectedIds.includes(tx.id)) {
                                                        setSelectedIds(selectedIds.filter(id => id !== tx.id));
                                                    } else {
                                                        setSelectedIds([...selectedIds, tx.id]);
                                                    }
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                            {format(new Date(tx.date), 'MMM d, yyyy')}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1.25rem' }}>
                                                    {isTransfer ? '🔄' : (category?.icon || '💸')}
                                                </span>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                        {isTransfer ? `Transfer to ${getAccountName(tx.toAccountId)}` : (category?.name || 'Uncategorized')}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                        {tx.type}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                            {getAccountName(tx.accountId)}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {tx.note || '-'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.9375rem', color: isIncome ? 'var(--success)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                                            {isIncome && '+'}{isExpense && '-'}{data.user.currency}{Number(tx.amount).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
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
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Trash2 size={14} color="var(--danger)" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
