import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start') ? new Date(searchParams.get('start')!) : undefined;
  const end = searchParams.get('end') ? new Date(searchParams.get('end')!) : undefined;
  const sourceId = searchParams.get('sourceId') || undefined;
  const type = searchParams.get('type') || undefined;

  const where: any = {};
  if (start || end) {
    where.date = {};
    if (start) where.date.gte = startOfDay(start);
    if (end) where.date.lte = endOfDay(end);
  }
  if (sourceId) where.sourceId = sourceId;
  if (type) where.type = type;

  const transactions = await prisma.transaction.findMany({
    where,
    include: { source: true },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, type, description, category, date, sourceId } = body;

    if (!amount || !type || !sourceId || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const amountNum = parseFloat(amount);

    const transaction = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.create({
        data: {
          amount: amountNum,
          type,
          description: description || '',
          category,
          date: date ? new Date(date) : new Date(),
          sourceId,
        },
        include: { source: true },
      });

      await tx.source.update({
        where: { id: sourceId },
        data: {
          balance: {
            increment: type === 'INCOME' ? amountNum : -amountNum,
          },
        },
      });

      return t;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, amount, type, description, category, date, sourceId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const newAmount = amount !== undefined ? parseFloat(amount) : Number(existing.amount);
    const newType = type || existing.type;

    const transaction = await prisma.$transaction(async (tx) => {
      // Revert old balance
      await tx.source.update({
        where: { id: existing.sourceId },
        data: {
          balance: {
            increment: existing.type === 'INCOME' ? -Number(existing.amount) : Number(existing.amount),
          },
        },
      });

      const t = await tx.transaction.update({
        where: { id },
        data: {
          amount: newAmount,
          type: newType,
          description,
          category,
          date: date ? new Date(date) : existing.date,
          sourceId: sourceId || existing.sourceId,
        },
        include: { source: true },
      });

      // Apply new balance
      await tx.source.update({
        where: { id: sourceId || existing.sourceId },
        data: {
          balance: {
            increment: newType === 'INCOME' ? newAmount : -newAmount,
          },
        },
      });

      return t;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.source.update({
        where: { id: existing.sourceId },
        data: {
          balance: {
            increment: existing.type === 'INCOME' ? -Number(existing.amount) : Number(existing.amount),
          },
        },
      });

      await tx.transaction.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
