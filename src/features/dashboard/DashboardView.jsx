import React from 'react';
import { useWealth } from '../../context/WealthContext';
import { Plus, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { TrendChart } from './TrendChart';

export const DashboardView = () => {
    const { data } = useWealth();

    const totalNetWorth = data?.accounts.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

    return (
        <div style={{ padding: '0 1.25rem', paddingTop: '1.25rem' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700'
                    }}>
                        {data?.user.name[0]}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Good Evening</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{data?.user.name}</div>
                    </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <Bell size={24} />
                </button>
            </header>

            {/* Net Worth Hero */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Net Worth</div>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.1' }}>
                    <sup style={{ fontSize: '1.5rem', fontWeight: '500', top: '-0.5em', marginRight: '4px' }}>{data?.user.currency}</sup>
                    {totalNetWorth.toLocaleString()}
                </h1>
                <div style={{
                    display: 'inline-flex', padding: '4px 12px', background: 'var(--primary-bg)',
                    borderRadius: '99px', marginTop: '1rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600'
                }}>
                    +2.4% this month
                </div>
            </div>

            {/* Quick Actions (Circular) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                <ActionButton icon={ArrowDownLeft} label="Income" color="var(--primary)" />
                <ActionButton icon={ArrowUpRight} label="Expense" color="var(--danger)" />
                <ActionButton icon={MoreHorizontal} label="More" color="var(--text-main)" />
            </div>

            {/* Chart Section */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Analytics</h3>
                    <small>Last 6 Months</small>
                </div>
                <div className="ios-card" style={{ height: '240px', padding: '1rem 0' }}>
                    <TrendChart />
                </div>
            </div>

            {/* Assets List */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Accounts</h3>
                    <small>See All</small>
                </div>
                {data?.accounts.map(acc => (
                    <div key={acc.id} className="ios-card" style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '1rem'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-subtle)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                            }}>
                                {acc.type === 'BANK' ? '🏦' : (acc.type === 'CASH' ? '💵' : '📈')}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{acc.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.type}</div>
                            </div>
                        </div>
                        <div style={{ fontWeight: '600' }}>{data.user.currency}{acc.balance.toLocaleString()}</div>
                    </div>
                ))}
            </div>

        </div>
    );
};

const ActionButton = ({ icon: Icon, label, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <button style={{
            width: '56px', height: '56px', borderRadius: '20px', background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color, cursor: 'pointer'
        }}>
            <Icon size={24} />
        </button>
        <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>{label}</span>
    </div>
);
