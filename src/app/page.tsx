import Link from 'next/link';
import { Wallet, ScanLine, Bell, Shield, Smartphone } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white mb-6 shadow-lg shadow-primary-200">
            <Wallet size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Money Tracker
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Track your daily expenses, manage multiple sources, scan receipts with OCR,
            and get automated reports via Telegram.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
            >
              Open App
            </Link>
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Telegram Mini App
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<Wallet size={24} />}
            title="Multi Source"
            description="Manage bank accounts, e-money, and cash in one place."
          />
          <FeatureCard
            icon={<ScanLine size={24} />}
            title="OCR Receipts"
            description="Scan payment screenshots and receipts automatically."
          />
          <FeatureCard
            icon={<Bell size={24} />}
            title="Telegram Reports"
            description="Get daily, weekly, and monthly reports on Telegram."
          />
          <FeatureCard
            icon={<Smartphone size={24} />}
            title="Responsive"
            description="Works perfectly on mobile and desktop."
          />
        </div>

        <div className="text-center text-slate-500 text-sm">
          <p>
            Private personal finance app.{' '}
            <Link href="/login" className="text-primary-600 hover:underline">
              Admin login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}
