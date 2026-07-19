'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import StatsCard from '@/components/StatsCard';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ReportData {
  income: number;
  expense: number;
  net: number;
  totalBalance: number;
  transactions: any[];
  byCategory: Record<string, number>;
}

export default function DashboardPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/reports?period=daily', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setReport(data);
    setLoading(false);
  }

  const categoryData = report
    ? Object.entries(report.byCategory).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#6b7280'];

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Overview of your finances today.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Balance"
              value={`Rp ${report?.totalBalance.toLocaleString('id-ID') || '0'}`}
              icon={<PiggyBank size={24} />}
              variant="default"
            />
            <StatsCard
              title="Today's Income"
              value={`Rp ${report?.income.toLocaleString('id-ID') || '0'}`}
              icon={<TrendingUp size={24} />}
              variant="success"
            />
            <StatsCard
              title="Today's Expense"
              value={`Rp ${report?.expense.toLocaleString('id-ID') || '0'}`}
              icon={<TrendingDown size={24} />}
              variant="danger"
            />
            <StatsCard
              title="Net Today"
              value={`Rp ${report?.net.toLocaleString('id-ID') || '0'}`}
              icon={<Wallet size={24} />}
              variant={report && report.net >= 0 ? 'success' : 'danger'}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h2>
              <TransactionList transactions={report?.transactions || []} onRefresh={fetchReport} />
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Transaction</h2>
              <TransactionForm onSuccess={fetchReport} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Expenses by Category</h2>
              {categoryData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">No expense data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
