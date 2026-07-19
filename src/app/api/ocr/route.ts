import { NextResponse } from 'next/server';
import { processOCR } from '@/lib/ocr';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image required' }, { status: 400 });
    }

    const { text, parsed } = await processOCR(image);

    const ocrResult = await prisma.oCRResult.create({
      data: {
        imageUrl: image,
        rawText: text,
        parsedAmount: parsed.amount ? parsed.amount : null,
        parsedSource: parsed.source,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      id: ocrResult.id,
      text,
      parsed,
    });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json({ error: 'Failed to process OCR' }, { status: 500 });
  }
}
