'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { Camera, Upload, CheckCircle, XCircle } from 'lucide-react';

export default function OCRPage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  async function processOCR() {
    if (!image) return;

    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const res = await fetch('/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image }),
    });

    const data = await res.json();

    if (res.ok) {
      setResult(data);
    } else {
      setError(data.error || 'Failed to process OCR');
    }

    setLoading(false);
  }

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">OCR Scan</h1>
          <p className="text-slate-500">Upload a receipt or payment screenshot to extract details.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="ocr-upload"
            />
            <label htmlFor="ocr-upload" className="cursor-pointer block">
              <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Camera size={32} />
              </div>
              <p className="text-lg font-medium text-slate-900 mb-1">Upload receipt image</p>
              <p className="text-sm text-slate-500">Click to select an image from your device</p>
            </label>
          </div>

          {image && (
            <div className="mt-6">
              <img src={image} alt="Receipt" className="max-h-64 mx-auto rounded-xl shadow-lg" />
              <button
                onClick={processOCR}
                disabled={loading}
                className="mt-4 w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                {loading ? 'Processing...' : 'Process with OCR'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <XCircle className="text-red-600" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-emerald-600" size={24} />
              <h2 className="text-lg font-semibold text-slate-900">OCR Result</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Amount</p>
                <p className="text-lg font-semibold text-slate-900">
                  {result.parsed.amount ? `Rp ${result.parsed.amount.toLocaleString('id-ID')}` : 'Not detected'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Source</p>
                <p className="text-lg font-semibold text-slate-900">
                  {result.parsed.source ? result.parsed.source.toUpperCase() : 'Not detected'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Category</p>
                <p className="text-lg font-semibold text-slate-900">
                  {result.parsed.category ? result.parsed.category.charAt(0).toUpperCase() + result.parsed.category.slice(1) : 'Not detected'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-lg font-semibold text-slate-900">
                  {result.parsed.description || 'Not detected'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Raw Text</p>
              <pre className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 overflow-auto max-h-48 whitespace-pre-wrap">
                {result.text}
              </pre>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
