'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { Transaction, Source } from '@prisma/client';

interface TransactionWithSource extends Transaction {
  source: Source;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', sourceId: '' });

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  async function fetchTransactions() {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (filter.type) params.append('type', filter.type);
    if (filter.sourceId) params.append('sourceId', filter.sourceId);

    const res = await fetch(`/api/transactions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTransactions(data);
    setLoading(false);
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500">View and manage all your transactions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                  className="px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                  <option value="">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <TransactionList transactions={transactions} onRefresh={fetchTransactions} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Transaction</h2>
            <TransactionForm onSuccess={fetchTransactions} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
