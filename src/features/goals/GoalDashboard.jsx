import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { Plus } from 'lucide-react';

export const GoalDashboard = () => {
    const { data } = useWealth();
    // Simplified goal logic for V3 - focusing on visual cleanliness
    const currentNetWorth = data.accounts.reduce((sum, a) => sum + Number(a.balance), 0);

    return (
        <div style={{ padding: '1.25rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Goals</h2>
                <button className="btn btn-soft" style={{ width: '32px', height: '32px', padding: '0', borderRadius: '50%' }}>
                    <Plus size={18} />
                </button>
            </header>

            <div className="ios-card" style={{ background: 'linear-gradient(135deg, #18181b 0%, #000 100%)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>RETIREMENT TARGET</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>{data.user.currency}1M</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>
                        {((currentNetWorth / 1000000) * 100).toFixed(1)}% Done
                    </div>
                </div>
                {/* Progress Bar */}
                <div style={{ height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${Math.min(100, (currentNetWorth / 1000000) * 100)}%`,
                        background: 'var(--primary)', height: '100%'
                    }}></div>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Current: {data.user.currency}{currentNetWorth.toLocaleString()}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="ios-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '120px', gap: '0.5rem', border: '1px dashed var(--border-subtle)', background: 'transparent' }}>
                    <div style={{ color: 'var(--text-dim)' }}>+ Add Goal</div>
                </div>
            </div>
        </div>
    );
};
