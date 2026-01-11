import React, { useState } from 'react';
import { useWealth } from '../../context/WealthContext';
import { Plus, Target, TrendingUp, Calendar, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, differenceInMonths } from 'date-fns';

export const GoalDashboard = () => {
    const { data, addGoal, updateGoal, deleteGoal } = useWealth();
    const [showModal, setShowModal] = useState(false);
    const [newGoal, setNewGoal] = useState({
        name: '',
        targetAmount: '',
        deadline: '',
        icon: '🎯'
    });

    // Calculate financial insights from historical data
    const getFinancialInsights = () => {
        const now = new Date();
        const last3Months = [];

        for (let i = 0; i < 3; i++) {
            const month = subMonths(now, i);
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);

            const monthTx = data.transactions.filter(tx => {
                const txDate = new Date(tx.date);
                return txDate >= monthStart && txDate <= monthEnd;
            });

            const income = monthTx
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const expenses = monthTx
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            last3Months.push({
                month: format(month, 'MMM'),
                income,
                expenses,
                savings: income - expenses
            });
        }

        const avgIncome = last3Months.reduce((sum, m) => sum + m.income, 0) / last3Months.length;
        const avgExpenses = last3Months.reduce((sum, m) => sum + m.expenses, 0) / last3Months.length;
        const avgSavings = avgIncome - avgExpenses;
        const savingsRate = avgIncome > 0 ? (avgSavings / avgIncome) * 100 : 0;

        return {
            avgMonthlyIncome: Math.round(avgIncome),
            avgMonthlyExpenses: Math.round(avgExpenses),
            avgMonthlySavings: Math.round(avgSavings),
            savingsRate: Math.round(savingsRate),
            last3Months: last3Months.reverse()
        };
    };

    const insights = getFinancialInsights();
    const currentNetWorth = data.accounts.reduce((sum, a) => sum + Number(a.balance), 0);

    const handleAddGoal = () => {
        if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return;

        addGoal({
            name: newGoal.name,
            targetAmount: Number(newGoal.targetAmount),
            currentAmount: 0,
            deadline: newGoal.deadline,
            icon: newGoal.icon
        });

        setNewGoal({ name: '', targetAmount: '', deadline: '', icon: '🎯' });
        setShowModal(false);
    };

    const calculateProgress = (goal) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const monthsLeft = differenceInMonths(new Date(goal.deadline), new Date());
        const monthlyRequired = monthsLeft > 0 ? (goal.targetAmount - goal.currentAmount) / monthsLeft : 0;

        return {
            percentage: Math.min(100, Math.round(progress)),
            monthsLeft: Math.max(0, monthsLeft),
            monthlyRequired: Math.max(0, Math.round(monthlyRequired)),
            isOnTrack: monthlyRequired <= insights.avgMonthlySavings
        };
    };

    const iconOptions = ['🎯', '🏠', '🚗', '✈️', '💍', '📚', '💼', '🎓', '🏖️', '💰'];

    return (
        <div style={{ padding: '1.5rem 1.25rem' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Goals</h2>
                <button
                    className="btn-icon"
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={20} />
                </button>
            </header>

            {/* Financial Insights Card */}
            <div className="hero-card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
                <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    marginBottom: '0.75rem'
                }}>
                    📊 Your Savings Pattern
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Avg Income</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                            {data.user.currency}{insights.avgMonthlyIncome.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Avg Expenses</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                            {data.user.currency}{insights.avgMonthlyExpenses.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Avg Savings</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4ade80' }}>
                            {data.user.currency}{insights.avgMonthlySavings.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem'
                }}>
                    💡 Based on your last 3 months, you save <strong>{insights.savingsRate}%</strong> of your income.
                    You can realistically save <strong>{data.user.currency}{insights.avgMonthlySavings.toLocaleString()}</strong> per month.
                </div>
            </div>

            {/* Goals List */}
            <div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 700 }}>Your Goals</h3>

                {data.goals?.length === 0 || !data.goals ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: 'var(--text-tertiary)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            No goals yet
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                            Set a savings goal to track your progress
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data.goals.map(goal => {
                            const stats = calculateProgress(goal);

                            return (
                                <div key={goal.id} className="glass-card">
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{
                                            fontSize: '2.5rem',
                                            width: '64px',
                                            height: '64px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                                            borderRadius: 'var(--radius-md)',
                                            flexShrink: 0
                                        }}>
                                            {goal.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                                {goal.name}
                                            </h4>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                <Calendar size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                                {stats.monthsLeft} months left • {format(new Date(goal.deadline), 'MMM yyyy')}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {data.user.currency}{goal.currentAmount.toLocaleString()} / {data.user.currency}{goal.targetAmount.toLocaleString()}
                                            </span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                                                {stats.percentage}%
                                            </span>
                                        </div>
                                        <div style={{
                                            height: '8px',
                                            background: 'var(--bg-soft)',
                                            borderRadius: '9999px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${stats.percentage}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        padding: '1rem',
                                        background: stats.isOnTrack ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.875rem'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                                Required/Month
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                                                {data.user.currency}{stats.monthlyRequired.toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: stats.isOnTrack ? 'var(--success)' : 'var(--danger)',
                                            fontWeight: 600
                                        }}>
                                            {stats.isOnTrack ? '✓ On Track' : '⚠ Challenging'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Goal Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="glass-card" style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>New Goal</h3>
                            <button
                                className="btn-icon"
                                onClick={() => setShowModal(false)}
                                style={{ width: '32px', height: '32px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Icon Picker */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem'
                                }}>
                                    Icon
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {iconOptions.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setNewGoal({ ...newGoal, icon })}
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                fontSize: '1.5rem',
                                                background: newGoal.icon === icon ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))' : 'var(--bg-soft)',
                                                border: newGoal.icon === icon ? '2px solid #667eea' : '1px solid var(--border)',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem'
                                }}>
                                    Goal Name
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newGoal.name}
                                    onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                                    placeholder="e.g., Emergency Fund, Dream Vacation"
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem'
                                }}>
                                    Target Amount
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    value={newGoal.targetAmount}
                                    onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '0.5rem'
                                }}>
                                    Target Date
                                </label>
                                <input
                                    type="date"
                                    className="input"
                                    value={newGoal.deadline}
                                    onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                />
                            </div>

                            <button
                                className="btn-primary"
                                onClick={handleAddGoal}
                                style={{ marginTop: '0.5rem', padding: '1.125rem' }}
                            >
                                Create Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
