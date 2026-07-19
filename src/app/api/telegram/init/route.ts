import { NextResponse } from 'next/server';
import { initTelegramBot } from '@/lib/telegram';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bot = initTelegramBot();
    return NextResponse.json({ success: true, bot: !!bot });
  } catch (error) {
    console.error('Init bot error:', error);
    return NextResponse.json({ error: 'Failed to init bot' }, { status: 500 });
  }
}
