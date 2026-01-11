import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { DashboardView } from '../../features/dashboard/DashboardView';
import { TransactionsView } from '../../features/transactions/TransactionsView';
import { GoalDashboard } from '../../features/goals/GoalDashboard';
import { SettingsView } from '../../features/settings/SettingsView';

export const AppShell = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardView onNavigate={setActiveTab} />;
            case 'transactions':
                return <TransactionsView />;
            case 'goals':
                return <GoalDashboard />;
            case 'settings':
                return <SettingsView />;
            default:
                return <DashboardView onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="app-container">
            <div className="fade-in">
                {renderContent()}
            </div>
            <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};
