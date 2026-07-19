'use client';

import { useState } from 'react';
import { Transaction, Source } from '@prisma/client';
import { format } from 'date-fns';
import { Trash2, Edit2 } from 'lucide-react';

interface TransactionWithSource extends Transaction {
  source: Source;
}

interface TransactionListProps {
  transactions: TransactionWithSource[];
  onRefresh: () => void;
}

export default function TransactionList({ transactions, onRefresh }: TransactionListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    setDeleting(id);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/transactions?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      onRefresh();
    }
    setDeleting(null);
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Source</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                  {format(new Date(t.date), 'dd MMM yyyy')}
                </td>
                <td className="px-4 py-3 text-sm text-slate-900">{t.description || '-'}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {t.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{t.source.name}</td>
                <td className="px-4 py-3 text-sm font-medium text-right whitespace-nowrap">
                  <span className={t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}>
                    {t.type === 'INCOME' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
