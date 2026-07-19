'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Source, SourceType } from '@prisma/client';
import { Wallet, CreditCard, Banknote, Trash2, Plus } from 'lucide-react';

const SOURCE_TYPES: SourceType[] = ['BANK', 'E_MONEY', 'CASH'];

const SOURCE_ICONS: Record<SourceType, React.ReactNode> = {
  BANK: <Banknote size={24} />,
  E_MONEY: <CreditCard size={24} />,
  CASH: <Wallet size={24} />,
};

const PREDEFINED_SOURCES = [
  { name: 'Mandiri', type: 'BANK' as SourceType, color: '#003399' },
  { name: 'BCA', type: 'BANK' as SourceType, color: '#0066b3' },
  { name: 'BNI', type: 'BANK' as SourceType, color: '#e31837' },
  { name: 'BRI', type: 'BANK' as SourceType, color: '#00529c' },
  { name: 'GoPay', type: 'E_MONEY' as SourceType, color: '#00aed6' },
  { name: 'OVO', type: 'E_MONEY' as SourceType, color: '#4d2ca8' },
  { name: 'DANA', type: 'E_MONEY' as SourceType, color: '#008cef' },
  { name: 'ShopeePay', type: 'E_MONEY' as SourceType, color: '#ee4d2d' },
  { name: 'LinkAja', type: 'E_MONEY' as SourceType, color: '#d4322c' },
  { name: 'Cash', type: 'CASH' as SourceType, color: '#10b981' },
];

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'BANK' as SourceType,
    balance: '',
    color: '#6366f1',
  });

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
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        balance: parseFloat(formData.balance) || 0,
      }),
    });

    if (res.ok) {
      setFormData({ name: '', type: 'BANK', balance: '', color: '#6366f1' });
      fetchSources();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/sources?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSources();
  }

  async function addPredefined(source: typeof PREDEFINED_SOURCES[0]) {
    const token = localStorage.getItem('token');
    await fetch('/api/sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...source, balance: 0 }),
    });
    fetchSources();
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Sources</h1>
          <p className="text-slate-500">Manage your bank accounts, e-money, and cash.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Source</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="e.g. Mandiri Savings"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as SourceType })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Balance</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Source
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Add</h3>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_SOURCES.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => addPredefined(s)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    + {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Sources</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : sources.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No sources yet. Add one to get started.</p>
            ) : (
              <div className="space-y-3">
                {sources.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: s.color }}
                      >
                        {SOURCE_ICONS[s.type]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-slate-900">
                        Rp {Number(s.balance).toLocaleString('id-ID')}
                      </p>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
