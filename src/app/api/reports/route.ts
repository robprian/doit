import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'daily';
  const dateParam = searchParams.get('date');
  const date = dateParam ? new Date(dateParam) : new Date();

  let start: Date;
  let end: Date;

  switch (period) {
    case 'weekly':
      start = startOfWeek(date, { weekStartsOn: 1 });
      end = endOfWeek(date, { weekStartsOn: 1 });
      break;
    case 'monthly':
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    default:
      start = startOfDay(date);
      end = endOfDay(date);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    include: { source: true },
    orderBy: { date: 'desc' },
  });

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const byCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
    });

  const bySource: Record<string, number> = {};
  transactions.forEach((t) => {
    bySource[t.source.name] = (bySource[t.source.name] || 0) + Number(t.amount);
  });

  const sources = await prisma.source.findMany();
  const totalBalance = sources.reduce((sum, s) => sum + Number(s.balance), 0);

  return NextResponse.json({
    period,
    start,
    end,
    income,
    expense,
    net: income - expense,
    totalBalance,
    transactions,
    byCategory,
    bySource,
  });
}
