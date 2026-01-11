import React from 'react';
import { Home, PieChart, Settings, Repeat } from 'lucide-react'; // Changed ArrowRightLeft to Repeat for 'Transact'

export const Navbar = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'transact', icon: Repeat, label: 'Transact' },
        { id: 'goals', icon: PieChart, label: 'Goals' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '440px',
            zIndex: 100
        }} className="glass-nav">
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '12px 0 24px 0' // Extra bottom padding for iOS Home Indicator
            }}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                width: '64px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                transform: isActive ? 'translateY(-2px)' : 'none',
                                color: isActive ? '#000000' : '#A0A0A5' // Black active, gray inactive
                            }}>
                                <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: isActive ? '700' : '500',
                                color: isActive ? '#000000' : '#A0A0A5',
                                transition: 'color 0.2s'
                            }}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
