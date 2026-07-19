import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sources = await prisma.source.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(sources);
}

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, icon, color, balance } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type required' }, { status: 400 });
    }

    const source = await prisma.source.create({
      data: {
        name,
        type,
        icon: icon || 'wallet',
        color: color || '#6366f1',
        balance: balance ? parseFloat(balance) : 0,
      },
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error('Create source error:', error);
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, type, icon, color, balance } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const source = await prisma.source.update({
      where: { id },
      data: {
        name,
        type,
        icon,
        color,
        balance: balance !== undefined ? parseFloat(balance) : undefined,
      },
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error('Update source error:', error);
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 });
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

    await prisma.source.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete source error:', error);
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
  }
}
