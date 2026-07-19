import { NextResponse } from 'next/server';
import { generateDailyReport, generateWeeklyReport, generateMonthlyReport, generateBalanceReport } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id.toString();
    const text = message.text.toLowerCase();

    let responseText = '';

    switch (text) {
      case '/start':
        responseText = 'Welcome to Money Tracker! Use /daily, /weekly, /monthly, or /balance.';
        break;
      case '/daily':
        responseText = await generateDailyReport();
        break;
      case '/weekly':
        responseText = await generateWeeklyReport();
        break;
      case '/monthly':
        responseText = await generateMonthlyReport();
        break;
      case '/balance':
        responseText = await generateBalanceReport();
        break;
      default:
        responseText = 'Unknown command. Try /daily, /weekly, /monthly, or /balance.';
    }

    return NextResponse.json({
      method: 'sendMessage',
      chat_id: chatId,
      text: responseText,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}
