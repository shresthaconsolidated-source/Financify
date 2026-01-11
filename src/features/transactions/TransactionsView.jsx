import React from 'react';
import { TransactionForm } from './TransactionForm';
import { TransactionHistory } from './TransactionHistory';

export const TransactionsView = () => {
    return (
        <div style={{ padding: '1.5rem 1.25rem' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 800 }}>Transactions</h2>

            <div style={{ marginBottom: '2rem' }}>
                <TransactionForm />
            </div>

            <div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 700 }}>History</h3>
                <TransactionHistory />
            </div>
        </div>
    );
};
