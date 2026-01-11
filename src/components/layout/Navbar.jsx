import React from 'react';
import { Home, PieChart, Repeat, Target, Settings } from 'lucide-react';

export const Navbar = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'transactions', icon: Repeat, label: 'Transact' },
        // { id: 'stats', icon: PieChart, label: 'Stats' },
        { id: 'goals', icon: Target, label: 'Goals' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <nav style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'rgba(18, 18, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
            paddingTop: '12px',
            zIndex: 100
        }}>
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            width: '64px'
                        }}
                    >
                        <Icon
                            size={24}
                            color={isActive ? 'var(--primary)' : 'var(--text-dim)'}
                            strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span style={{
                            fontSize: '10px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? 'var(--text-main)' : 'var(--text-dim)'
                        }}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};
