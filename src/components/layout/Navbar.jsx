import React from 'react';
import { Home, Repeat, Target, Settings } from 'lucide-react';

export const Navbar = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'transactions', icon: Repeat, label: 'Activity' },
        { id: 'goals', icon: Target, label: 'Goals' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <nav className="bottom-nav">
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '0 1rem'
            }}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                minWidth: '64px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                color={isActive ? '#0a0a0a' : '#a3a3a3'}
                                style={{ transition: 'color 0.2s ease' }}
                            />
                            <span style={{
                                fontSize: '0.625rem',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#0a0a0a' : '#a3a3a3',
                                transition: 'color 0.2s ease'
                            }}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
