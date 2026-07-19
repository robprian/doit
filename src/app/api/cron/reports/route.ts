import { NextResponse } from 'next/server';
import { generateDailyReport, generateWeeklyReport, generateMonthlyReport, sendTelegramMessage } from '@/lib/telegram';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'daily';
  const secret = request.headers.get('x-cron-secret') || searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let message = '';
    const now = new Date();

    switch (type) {
      case 'daily':
        message = await generateDailyReport(now);
        break;
      case 'weekly':
        message = await generateWeeklyReport(now);
        break;
      case 'monthly':
        message = await generateMonthlyReport(now);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    await sendTelegramMessage(message);

    return NextResponse.json({ success: true, type });
  } catch (error) {
    console.error('Cron report error:', error);
    return NextResponse.json({ error: 'Failed to send report' }, { status: 500 });
  }
}
