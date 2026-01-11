import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { v4 as uuidv4 } from 'uuid';

const WealthContext = createContext();

export const useWealth = () => useContext(WealthContext);

export const WealthProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load data on mount
    useEffect(() => {
        const loaded = StorageService.loadData();
        setData(loaded);
        setLoading(false);
    }, []);

    // Auto-save whenever data changes
    useEffect(() => {
        if (data && !loading) {
            StorageService.saveData(data);
        }
    }, [data, loading]);

    const addTransaction = (transaction) => {
        const newTx = { ...transaction, id: uuidv4(), date: new Date().toISOString() };

        setData(prev => {
            let newAccounts = [...prev.accounts];

            // Update account balances
            if (newTx.type === 'INCOME') {
                const accIndex = newAccounts.findIndex(a => a.id === newTx.accountId);
                if (accIndex >= 0) {
                    newAccounts[accIndex] = {
                        ...newAccounts[accIndex],
                        balance: Number(newAccounts[accIndex].balance) + Number(newTx.amount)
                    };
                }
            } else if (newTx.type === 'EXPENSE') {
                const accIndex = newAccounts.findIndex(a => a.id === newTx.accountId);
                if (accIndex >= 0) {
                    newAccounts[accIndex] = {
                        ...newAccounts[accIndex],
                        balance: Number(newAccounts[accIndex].balance) - Number(newTx.amount)
                    };
                }
            } else if (newTx.type === 'TRANSFER') {
                const fromIndex = newAccounts.findIndex(a => a.id === newTx.accountId);
                const toIndex = newAccounts.findIndex(a => a.id === newTx.toAccountId);

                if (fromIndex >= 0) {
                    newAccounts[fromIndex] = {
                        ...newAccounts[fromIndex],
                        balance: Number(newAccounts[fromIndex].balance) - Number(newTx.amount)
                    };
                }
                if (toIndex >= 0) {
                    newAccounts[toIndex] = {
                        ...newAccounts[toIndex],
                        balance: Number(newAccounts[toIndex].balance) + Number(newTx.amount)
                    };
                }
            }

            return {
                ...prev,
                accounts: newAccounts,
                transactions: [newTx, ...prev.transactions]
            };
        });
    };

    const addAccount = (account) => {
        const newAccount = { ...account, id: uuidv4(), balance: Number(account.openingBalance) };
        setData(prev => ({
            ...prev,
            accounts: [...prev.accounts, newAccount]
        }));
    };

    const updateAccount = (id, updates) => {
        setData(prev => ({
            ...prev,
            accounts: prev.accounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc)
        }));
    }

    const updateCurrency = (currency) => {
        setData(prev => ({ ...prev, user: { ...prev.user, currency } }));
    };

    const addCategory = (category) => {
        setData(prev => ({
            ...prev,
            categories: [...prev.categories, { ...category, id: uuidv4() }]
        }));
    };

    const deleteCategory = (id) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c.id !== id)
        }));
    };

    const addAssetClass = (name) => {
        setData(prev => ({
            ...prev,
            assetClasses: [...(prev.assetClasses || []), { id: uuidv4(), name }]
        }));
    };

    const deleteAssetClass = (id) => {
        setData(prev => ({
            ...prev,
            assetClasses: (prev.assetClasses || []).filter(a => a.id !== id)
        }));
    };

    const importData = (newData) => {
        if (!newData || !newData.user || !newData.accounts) return false;
        setData(newData);
        return true;
    };

    const importExcelTransactions = (rows) => {
        if (!rows || rows.length === 0) return 0;

        setData(prev => {
            let newAccounts = [...prev.accounts];
            let newCategories = [...prev.categories];
            let newTxList = [];

            rows.forEach(row => {
                const { date, type, amount, accountName, categoryName, note } = row;

                // 1. Helper to find exact match (case-insensitive)
                const findAccount = (name) => newAccounts.find(a => a.name.toLowerCase() === name.toLowerCase());
                const findCategory = (name) => newCategories.find(c => c.name.toLowerCase() === name.toLowerCase());

                // 2. Account Logic (Auto-Create)
                let account = findAccount(accountName);
                if (!account) {
                    account = {
                        id: uuidv4(),
                        name: accountName,
                        type: 'CASH', // Default to Cash for safety
                        balance: 0,
                        isAutoCreated: true
                    };
                    newAccounts.push(account);
                }

                // 3. Category Logic (Auto-Create)
                let category = findCategory(categoryName);
                if (!category) {
                    category = {
                        id: uuidv4(),
                        name: categoryName,
                        type: type === 'INCOME' ? 'INCOME' : 'EXPENSE', // Guess type based on transaction
                        icon: '❓',
                        isAutoCreated: true
                    };
                    newCategories.push(category);
                }

                // 4. Create Transaction
                const newTx = {
                    id: uuidv4(),
                    date: new Date(date).toISOString(), // Excel dates might need parsing if raw number, but assuming string 'YYYY-MM-DD' for now
                    type: type,
                    amount: amount,
                    accountId: account.id,
                    categoryId: category.id,
                    note: note || 'Imported'
                };

                newTxList.push(newTx);

                // 5. Update Balance
                const accIndex = newAccounts.findIndex(a => a.id === account.id);
                if (accIndex >= 0) {
                    const currentBal = Number(newAccounts[accIndex].balance);
                    if (type === 'INCOME') {
                        newAccounts[accIndex] = { ...newAccounts[accIndex], balance: currentBal + amount };
                    } else if (type === 'EXPENSE') {
                        newAccounts[accIndex] = { ...newAccounts[accIndex], balance: currentBal - amount };
                    } else if (type === 'TRANSFER') {
                        // Simplify transfer for bulk import: maybe just deduct? 
                        // Real transfer needs 'ToAccount'. For now, treat as expense-like deduction from source.
                        newAccounts[accIndex] = { ...newAccounts[accIndex], balance: currentBal - amount };
                        // Ideally transfers in CSV need 'To Account' column. 
                        // Simplification: Treat bulk import transfers as withdrawals.
                    }
                }
            });

            return {
                ...prev,
                accounts: newAccounts,
                categories: newCategories,
                transactions: [...newTxList, ...prev.transactions]
            };
        });
        return rows.length;
    };

    const value = {
        data,
        loading,
        addTransaction,
        addAccount,
        updateAccount,
        updateCurrency,
        addCategory,
        deleteCategory,
        addAssetClass,
        deleteAssetClass,
        importData,
        importExcelTransactions
    };

    return (
        <WealthContext.Provider value={value}>
            {!loading ? children : <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>Loading...</div>}
        </WealthContext.Provider>
    );
};
