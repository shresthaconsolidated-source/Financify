import React, { useState } from 'react';
import { Navbar } from './Navbar';
// We will simply import the views. We rely on them being updated next.
import { TransactionsView } from '../../features/transactions/TransactionsView';
import { DashboardView } from '../../features/dashboard/DashboardView';
import { SettingsView } from '../../features/settings/SettingsView';
import { GoalDashboard } from '../../features/goals/GoalDashboard';

export const AppShell = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView />;
            case 'transactions': return <TransactionsView />;
            case 'goals': return <GoalDashboard />;
            case 'settings': return <SettingsView />;
            default: return <DashboardView />;
        }
    };

    return (
        <div className="app-container">
            <div className="fade-in" style={{ paddingBottom: '90px' }}> {/* Space for bottom nav */}
                {renderContent()}
            </div>
            <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};
