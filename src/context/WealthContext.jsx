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

    const updateTransaction = (txId, updates) => {
        setData(prev => {
            const oldTx = prev.transactions.find(t => t.id === txId);
            if (!oldTx) return prev;

            // Reverse old transaction effects on balances
            let newAccounts = [...prev.accounts];

            if (oldTx.type === 'INCOME') {
                const accIndex = newAccounts.findIndex(a => a.id === oldTx.accountId);
                if (accIndex >= 0) {
                    newAccounts[accIndex].balance = Number(newAccounts[accIndex].balance) - Number(oldTx.amount);
                }
            } else if (oldTx.type === 'EXPENSE') {
                const accIndex = newAccounts.findIndex(a => a.id === oldTx.accountId);
                if (accIndex >= 0) {
                    newAccounts[accIndex].balance = Number(newAccounts[accIndex].balance) + Number(oldTx.amount);
                }
            } else if (oldTx.type === 'TRANSFER') {
                const fromIndex = newAccounts.findIndex(a => a.id === oldTx.accountId);
                const toIndex = newAccounts.findIndex(a => a.id === oldTx.toAccountId);
                if (fromIndex >= 0) newAccounts[fromIndex].balance = Number(newAccounts[fromIndex].balance) + Number(oldTx.amount);
                if (toIndex >= 0) newAccounts[toIndex].balance = Number(newAccounts[toIndex].balance) - Number(oldTx.amount);
            }

            // Apply new transaction
            const newTx = { ...oldTx, ...updates };

            if (newTx.type === 'INCOME') {
                const accIndex = newAccounts.findIndex(a => a.id === newTx.accountId);
                if (accIndex >= 0) {
                    newAccounts[accIndex].balance = Number(newAccounts[accIndex].balance) + Number(newTx.amount);
                }
            } else if (newTx.type === 'EXPENSE') {
                const accIndex = newAccounts.findIndex(a => a.id === newTx.accountId);
                if (accIndex >= 0) {
                    newAccounts[accIndex].balance = Number(newAccounts[accIndex].balance) - Number(newTx.amount);
                }
            } else if (newTx.type === 'TRANSFER') {
                const fromIndex = newAccounts.findIndex(a => a.id === newTx.accountId);
                const toIndex = newAccounts.findIndex(a => a.id === newTx.toAccountId);
                if (fromIndex >= 0) newAccounts[fromIndex].balance = Number(newAccounts[fromIndex].balance) - Number(newTx.amount);
                if (toIndex >= 0) newAccounts[toIndex].balance = Number(newAccounts[toIndex].balance) + Number(newTx.amount);
            }

            return {
                ...prev,
                accounts: newAccounts,
                transactions: prev.transactions.map(t => t.id === txId ? newTx : t)
            };
        });
    };

    const deleteTransaction = (txId) => {
        setData(prev => {
            const tx = prev.transactions.find(t => t.id === txId);
            if (!tx) return prev;

            // Reverse transaction effects
            let newAccounts = [...prev.accounts];

            if (tx.type === 'INCOME') {
                const accIndex = newAccounts.findIndex(a => a.id === tx.accountId);
                if (accIndex >= 0) {
                    newAccounts[accIndex].balance = Number(newAccounts[accIndex].balance) - Number(tx.amount);
                }
            } else if (tx.type === 'EXPENSE') {
                const accIndex = newAccounts.findIndex(a => a.id === tx.accountId);
                if (accIndex >= 0) {
                    newAccounts[accIndex].balance = Number(newAccounts[accIndex].balance) + Number(tx.amount);
                }
            } else if (tx.type === 'TRANSFER') {
                const fromIndex = newAccounts.findIndex(a => a.id === tx.accountId);
                const toIndex = newAccounts.findIndex(a => a.id === tx.toAccountId);
                if (fromIndex >= 0) newAccounts[fromIndex].balance = Number(newAccounts[fromIndex].balance) + Number(tx.amount);
                if (toIndex >= 0) newAccounts[toIndex].balance = Number(newAccounts[toIndex].balance) - Number(tx.amount);
            }

            return {
                ...prev,
                accounts: newAccounts,
                transactions: prev.transactions.filter(t => t.id !== txId)
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
    };

    const deleteAccount = (id) => {
        setData(prev => ({
            ...prev,
            accounts: prev.accounts.filter(acc => acc.id !== id),
            // Also remove transactions associated with this account
            transactions: prev.transactions.filter(tx => tx.accountId !== id && tx.toAccountId !== id)
        }));
    };

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
                const { date, type, amount, accountName, toAccountName, categoryName, note } = row;

                // 1. Helper to find exact match (case-insensitive)
                const findAccount = (name) => newAccounts.find(a => a.name.toLowerCase() === name.toLowerCase());
                const findCategory = (name) => newCategories.find(c => c.name.toLowerCase() === name.toLowerCase());

                // 2. Account Logic (Auto-Create) - Check against growing array
                let account = newAccounts.find(a => a.name.toLowerCase() === accountName.toLowerCase());
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

                // 2b. For transfers, handle To Account - Check against growing array
                let toAccount = null;
                if (type === 'TRANSFER' && toAccountName) {
                    toAccount = newAccounts.find(a => a.name.toLowerCase() === toAccountName.toLowerCase());
                    if (!toAccount) {
                        toAccount = {
                            id: uuidv4(),
                            name: toAccountName,
                            type: 'CASH',
                            balance: 0,
                            isAutoCreated: true
                        };
                        newAccounts.push(toAccount);
                    }
                }

                // 3. Category Logic (Auto-Create) - Skip for transfers
                let category = null;
                if (type !== 'TRANSFER' && categoryName) {
                    category = findCategory(categoryName);
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
                }

                // 4. Create Transaction
                const newTx = {
                    id: uuidv4(),
                    date: date.includes('-') ? `${date}T00:00:00.000Z` : new Date(date).toISOString(),
                    type: type,
                    amount: amount,
                    accountId: account.id,
                    categoryId: category?.id || null,
                    note: note || 'Imported'
                };

                // Add toAccountId for transfers
                if (type === 'TRANSFER' && toAccount) {
                    newTx.toAccountId = toAccount.id;
                }

                newTxList.push(newTx);

                // 5. Update Balance
                const accIndex = newAccounts.findIndex(a => a.id === account.id);
                if (accIndex >= 0) {
                    const currentBal = Number(newAccounts[accIndex].balance);
                    if (type === 'INCOME') {
                        newAccounts[accIndex] = { ...newAccounts[accIndex], balance: currentBal + amount };
                    } else if (type === 'EXPENSE') {
                        newAccounts[accIndex] = { ...newAccounts[accIndex], balance: currentBal - amount };
                    } else if (type === 'TRANSFER' && toAccount) {
                        // Deduct from source account
                        newAccounts[accIndex] = { ...newAccounts[accIndex], balance: currentBal - amount };
                        // Add to destination account
                        const toAccIndex = newAccounts.findIndex(a => a.id === toAccount.id);
                        if (toAccIndex >= 0) {
                            const toCurrentBal = Number(newAccounts[toAccIndex].balance);
                            newAccounts[toAccIndex] = { ...newAccounts[toAccIndex], balance: toCurrentBal + amount };
                        }
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

    const mergeDuplicateAccounts = () => {
        setData(prev => {
            const accountMap = new Map();
            const duplicates = [];

            // 1. Find duplicates (case-insensitive)
            prev.accounts.forEach(acc => {
                const nameLower = acc.name.toLowerCase();
                if (accountMap.has(nameLower)) {
                    accountMap.get(nameLower).push(acc);
                } else {
                    accountMap.set(nameLower, [acc]);
                }
            });

            // 2. Identify which to keep and which to merge
            const accountsToKeep = [];
            const idsToRemove = new Set();
            const idMapping = new Map(); // old ID -> new ID

            accountMap.forEach((accounts) => {
                if (accounts.length > 1) {
                    // Multiple accounts with same name - merge them
                    const keeper = accounts[0]; // Keep the first one
                    let totalBalance = 0;

                    accounts.forEach(acc => {
                        totalBalance += Number(acc.balance);
                        if (acc.id !== keeper.id) {
                            idsToRemove.add(acc.id);
                            idMapping.set(acc.id, keeper.id);
                        }
                    });

                    accountsToKeep.push({ ...keeper, balance: totalBalance });
                    duplicates.push({ name: keeper.name, count: accounts.length, mergedBalance: totalBalance });
                } else {
                    // No duplicates, keep as is
                    accountsToKeep.push(accounts[0]);
                }
            });

            // 3. Update transactions to point to kept accounts
            const updatedTransactions = prev.transactions.map(tx => {
                let updated = { ...tx };
                if (idMapping.has(tx.accountId)) {
                    updated.accountId = idMapping.get(tx.accountId);
                }
                if (tx.toAccountId && idMapping.has(tx.toAccountId)) {
                    updated.toAccountId = idMapping.get(tx.toAccountId);
                }
                return updated;
            });

            return {
                ...prev,
                accounts: accountsToKeep,
                transactions: updatedTransactions
            };
        });
    };

    const addGoal = (goal) => {
        setData(prev => ({
            ...prev,
            goals: [...(prev.goals || []), { ...goal, id: uuidv4() }]
        }));
    };

    const updateGoal = (goalId, updates) => {
        setData(prev => ({
            ...prev,
            goals: prev.goals.map(g => g.id === goalId ? { ...g, ...updates } : g)
        }));
    };

    const deleteGoal = (goalId) => {
        setData(prev => ({
            ...prev,
            goals: prev.goals.filter(g => g.id !== goalId)
        }));
    };

    const value = {
        data,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        updateCurrency,
        addCategory,
        deleteCategory,
        addAssetClass,
        deleteAssetClass,
        importData,
        importExcelTransactions,
        mergeDuplicateAccounts,
        addGoal,
        updateGoal,
        deleteGoal
    };

    return (
        <WealthContext.Provider value={value}>
            {!loading ? children : <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>Loading...</div>}
        </WealthContext.Provider>
    );
};
