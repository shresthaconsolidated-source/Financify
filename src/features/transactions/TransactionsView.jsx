import React from 'react';
import { TransactionForm } from './TransactionForm';
import { TransactionHistory } from './TransactionHistory';

export const TransactionsView = () => {
    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Transactions</h2>

            <div style={{ marginBottom: '2rem' }}>
                <TransactionForm />
            </div>

            <h3 style={{ marginBottom: '1rem' }}>History</h3>
            <TransactionHistory />
        </div>
    );
};
