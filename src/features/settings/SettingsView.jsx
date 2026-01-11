import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { Plus, Trash2, Edit2, X, Wallet, TrendingUp, Building2, Smartphone, Download, Upload, FileText } from 'lucide-react';
import { generateSmartTemplate, parseExcel } from '../../utils/excelHelpers';
import { exportJSON, parseJSON } from '../../utils/csvHelpers';

export const SettingsView = () => {
    const { data, addAccount, updateCurrency, addCategory, deleteCategory, addAssetClass, deleteAssetClass, importData, importExcelTransactions } = useWealth();

    // Modals & State
    const [activeModal, setActiveModal] = useState(null);
    const [newAccount, setNewAccount] = useState({ name: '', type: 'BANK', subtype: '', openingBalance: 0 });
    const [newItemName, setNewItemName] = useState('');
    const [editingCurrency, setEditingCurrency] = useState(false);
    const [tempCurrency, setTempCurrency] = useState(data.user.currency);
    const [importStatus, setImportStatus] = useState('');

    const handleSaveAccount = (e) => {
        e.preventDefault();
        addAccount({
            ...newAccount,
            currency: data.user.currency,
            balance: newAccount.openingBalance,
            assetClass: newAccount.type === 'ASSET' ? newAccount.subtype : null
        });
        setActiveModal(null);
        setNewAccount({ name: '', type: 'BANK', subtype: '', openingBalance: 0 });
    };

    const handleSaveItem = (e) => {
        e.preventDefault();
        if (!newItemName) return;

        if (activeModal === 'ASSET_CLASS') {
            addAssetClass(newItemName);
        } else if (activeModal === 'CATEGORY_EXPENSE') {
            addCategory({ name: newItemName, type: 'EXPENSE', icon: '🏷️' });
        } else if (activeModal === 'CATEGORY_INCOME') {
            addCategory({ name: newItemName, type: 'INCOME', icon: '💰' });
        }

        setNewItemName('');
        setActiveModal(null);
    };

    const handleSaveCurrency = () => {
        updateCurrency(tempCurrency);
        setEditingCurrency(false);
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            if (type === 'JSON') {
                const json = await parseJSON(file);
                const success = importData(json);
                if (success) setImportStatus('Backup restored successfully!');
                else setImportStatus('Invalid backup file.');
            } else if (type === 'EXCEL') {
                const rows = await parseExcel(file);
                const count = importExcelTransactions(rows);
                setImportStatus(`Imported ${count} transactions successfully! (New accounts/categories auto-created)`);
            }
        } catch (err) {
            setImportStatus('Error importing file: ' + err.message);
        }
    };

    return (
        <div style={{ padding: '1.25rem', paddingBottom: '6rem' }} className="fade-in">
            <h1 style={{ marginBottom: '2rem' }}>Settings</h1>

            {/* Data Management Section (NEW) */}
            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Data Management</h3>
                <div className="ios-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Backup Actions */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-soft" style={{ flex: 1, height: 'auto', padding: '0.8rem', fontSize: '0.85rem' }} onClick={() => exportJSON(data)}>
                                <Download size={18} style={{ marginRight: '0.5rem' }} /> Backup (JSON)
                            </button>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <button className="btn btn-soft" style={{ width: '100%', height: 'auto', padding: '0.8rem', fontSize: '0.85rem' }}>
                                    <Upload size={18} style={{ marginRight: '0.5rem' }} /> Restore (JSON)
                                </button>
                                <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'JSON')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'var(--border-subtle)', width: '100%' }}></div>

                        {/* Excel Actions */}
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Smart Import (Excel)</h4>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-soft" style={{ flex: 1, height: 'auto', padding: '0.8rem', fontSize: '0.85rem' }} onClick={() => generateSmartTemplate(data.accounts, data.categories)}>
                                <FileText size={18} style={{ marginRight: '0.5rem' }} /> Get Excel Template
                            </button>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <button className="btn btn-primary" style={{ width: '100%', height: 'auto', padding: '0.8rem', fontSize: '0.85rem', color: '#000' }}>
                                    <Upload size={18} style={{ marginRight: '0.5rem' }} /> Upload Excel
                                </button>
                                <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, 'EXCEL')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                            </div>
                        </div>

                        {importStatus && <div style={{ fontSize: '0.8rem', color: 'var(--primary)', textAlign: 'center' }}>{importStatus}</div>}
                    </div>
                </div>
            </section>

            {/* Asset Classes Section */}
            <section style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Asset Classes</h3>
                    <span style={{ color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }} onClick={() => setActiveModal('ASSET_CLASS')}>+ Add</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(data.assetClasses || []).map(ac => (
                        <div key={ac.id} style={{
                            background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
                            padding: '0.5rem 0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem'
                        }}>
                            <span>{ac.name}</span>
                            <Trash2 size={14} color="var(--danger)" style={{ cursor: 'pointer' }} onClick={() => deleteAssetClass(ac.id)} />
                        </div>
                    ))}
                    {(!data.assetClasses || data.assetClasses.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No asset classes defined.</span>}
                </div>
            </section>

            {/* Accounts Section */}
            <section style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Accounts</h3>
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', height: 'auto' }} onClick={() => setActiveModal('ACCOUNT')}>
                        + Add
                    </button>
                </div>
                <div className="ios-card" style={{ padding: 0 }}>
                    {data.accounts.map((acc, i) => (
                        <div key={acc.id} style={{
                            padding: '1.25rem',
                            borderBottom: i === data.accounts.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {acc.type === 'BANK' && <Building2 size={16} />}
                                    {acc.type === 'CASH' && <Wallet size={16} />}
                                    {acc.type === 'ASSET' && <TrendingUp size={16} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{acc.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.assetClass || acc.type}</div>
                                </div>
                            </div>
                            <div style={{ color: 'var(--text-bright)', fontWeight: '600' }}>{data.user.currency}{Number(acc.balance).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories Section */}
            <section>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Categories</h3>

                {/* Expenses */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Expenses</span>
                        <span style={{ color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }} onClick={() => setActiveModal('CATEGORY_EXPENSE')}>+ Add</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {data.categories.filter(c => c.type === 'EXPENSE').map(cat => (
                            <div key={cat.id} style={{
                                background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
                                padding: '0.5rem 0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem'
                            }}>
                                <span>{cat.name}</span>
                                <Trash2 size={14} color="var(--danger)" style={{ cursor: 'pointer' }} onClick={() => deleteCategory(cat.id)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Income */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Income</span>
                        <span style={{ color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }} onClick={() => setActiveModal('CATEGORY_INCOME')}>+ Add</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {data.categories.filter(c => c.type === 'INCOME').map(cat => (
                            <div key={cat.id} style={{
                                background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
                                padding: '0.5rem 0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem'
                            }}>
                                <span>{cat.name}</span>
                                <Trash2 size={14} color="var(--danger)" style={{ cursor: 'pointer' }} onClick={() => deleteCategory(cat.id)} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Currency Section & Modals... (Reuse previous) */}
            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Global Currency</h3>
                <div className="ios-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Active Symbol</div>
                        {editingCurrency ? (
                            <input
                                autoFocus
                                value={tempCurrency}
                                onChange={e => setTempCurrency(e.target.value)}
                                style={{ background: 'black', border: '1px solid var(--primary)', color: 'var(--primary)', width: '60px', borderRadius: '8px', padding: '0.25rem', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}
                                onBlur={handleSaveCurrency}
                                onKeyDown={e => e.key === 'Enter' && handleSaveCurrency()}
                            />
                        ) : (
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.25rem' }}>{data.user.currency}</div>
                        )}
                    </div>
                    <button className="btn btn-soft" onClick={() => setEditingCurrency(true)}>
                        <Edit2 size={18} />
                    </button>
                </div>
            </section>

            {/* Reuse Modals... */}
            {activeModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="ios-card" style={{ width: '100%', maxWidth: '350px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>
                                {activeModal === 'ACCOUNT' && 'New Account'}
                                {activeModal === 'ASSET_CLASS' && 'New Asset Class'}
                                {activeModal.includes('CATEGORY') && 'New Category'}
                            </h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => { setActiveModal(null); setNewItemName(''); }} />
                        </div>

                        {activeModal === 'ACCOUNT' ? (
                            <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input className="input" placeholder="Account Name" value={newAccount.name} onChange={e => setNewAccount({ ...newAccount, name: e.target.value })} autoFocus required />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="button" className={`btn ${newAccount.type === 'BANK' ? 'btn-primary' : 'btn-soft'}`} style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => setNewAccount({ ...newAccount, type: 'BANK', subtype: '' })}>Bank</button>
                                    <button type="button" className={`btn ${newAccount.type === 'CASH' ? 'btn-primary' : 'btn-soft'}`} style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => setNewAccount({ ...newAccount, type: 'CASH', subtype: '' })}>Cash</button>
                                    <button type="button" className={`btn ${newAccount.type === 'ASSET' ? 'btn-primary' : 'btn-soft'}`} style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => setNewAccount({ ...newAccount, type: 'ASSET' })}>Asset</button>
                                </div>

                                {newAccount.type === 'ASSET' && (
                                    <select
                                        className="input"
                                        value={newAccount.subtype}
                                        onChange={e => setNewAccount({ ...newAccount, subtype: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Asset Class</option>
                                        {(data.assetClasses || []).map(ac => (
                                            <option key={ac.id} value={ac.name}>{ac.name}</option>
                                        ))}
                                    </select>
                                )}

                                <input type="number" className="input" placeholder="Opening Balance" value={newAccount.openingBalance} onChange={e => setNewAccount({ ...newAccount, openingBalance: e.target.value })} />
                                <button className="btn btn-primary">Save Account</button>
                            </form>
                        ) : (
                            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    className="input"
                                    placeholder={activeModal === 'ASSET_CLASS' ? "Asset Class Name (e.g. Gold)" : "Category Name"}
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    autoFocus
                                    required
                                />
                                <button className="btn btn-primary">Save</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
