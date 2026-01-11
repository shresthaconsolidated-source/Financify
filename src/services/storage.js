import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'wealth_tracker_data_v1';

const INITIAL_DATA = {
    user: {
        name: 'User',
        currency: 'USD',
    },
    accounts: [], // { id, name, type: 'BANK'|'CASH'|'ASSET', balance, currency }
    categories: [
        { id: 'cat_1', name: 'Salary', type: 'INCOME', icon: '💰' },
        { id: 'cat_2', name: 'Investments', type: 'INCOME', icon: '📈' },
        { id: 'cat_3', name: 'Food', type: 'EXPENSE', icon: '🍔' },
        { id: 'cat_4', name: 'Transport', type: 'EXPENSE', icon: '🚌' },
        { id: 'cat_5', name: 'Utilities', type: 'EXPENSE', icon: '💡' },
        { id: 'cat_6', name: 'Shopping', type: 'EXPENSE', icon: '🛍️' },
    ],
    assetClasses: [
        { id: 'a1', name: 'Shares' },
        { id: 'a2', name: 'Gold' },
        { id: 'a3', name: 'Fixed Deposit' },
        { id: 'a4', name: 'Real Estate' }
    ],
    transactions: [], // { id, date, amount, type: 'INCOME'|'EXPENSE'|'TRANSFER', accountId, toAccountId, categoryId, note }
    goals: [],
};

export const StorageService = {
    loadData: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
            // Initialize with default data if empty
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
            return INITIAL_DATA;
        } catch (error) {
            console.error('Failed to load data:', error);
            return INITIAL_DATA;
        }
    },

    saveData: (data) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    },

    // Helper to simulate "Email Login" isolation (simplified for local demo)
    // In a real app, this would swap storage keys based on email hash
    switchUser: (email) => {
        // For now, we just use one storage, but this is where we'd change the key
        // const userKey = `wealth_tracker_${email}`;
    }
};
