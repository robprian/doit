'use client';

import { useState, useEffect } from 'react';
import { Source } from '@prisma/client';

interface TransactionFormProps {
  onSuccess?: () => void;
}

const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'shopping',
  'bills',
  'entertainment',
  'health',
  'education',
  'others',
];

const INCOME_CATEGORIES = ['salary', 'freelance', 'investment', 'gift', 'others'];

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('food');
  const [sourceId, setSourceId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/sources', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSources(data);
    if (data.length > 0) setSourceId(data[0].id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        type,
        description,
        category,
        sourceId,
        date,
      }),
    });

    if (res.ok) {
      setAmount('');
      setDescription('');
      onSuccess?.();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to add transaction');
    }

    setLoading(false);
  }

  const categories = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setType('EXPENSE')}
          className={`py-2 rounded-lg font-medium text-sm transition-colors ${
            type === 'EXPENSE'
              ? 'bg-red-100 text-red-700 border-2 border-red-300'
              : 'bg-slate-100 text-slate-600 border-2 border-transparent'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('INCOME')}
          className={`py-2 rounded-lg font-medium text-sm transition-colors ${
            type === 'INCOME'
              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
              : 'bg-slate-100 text-slate-600 border-2 border-transparent'
          }`}
        >
          Income
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          placeholder="0"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          required
        >
          <option value="">Select source</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.type})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          required
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          placeholder="e.g. Lunch at cafe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add Transaction'}
      </button>
    </form>
  );
}
