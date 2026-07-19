import Tesseract from 'tesseract.js';

export interface OCRParseResult {
  amount: number | null;
  source: string | null;
  category: string | null;
  description: string | null;
}

const KNOWN_SOURCES = [
  'mandiri',
  'bca',
  'bni',
  'bri',
  'cimb',
  'gopay',
  'ovo',
  'dana',
  'shopeepay',
  'linkaja',
  'sakuku',
  'jenius',
  'blu',
  'cash',
];

const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'shopping',
  'bills',
  'entertainment',
  'health',
  'education',
  'others',
];

export async function processOCR(imageDataUrl: string): Promise<{ text: string; parsed: OCRParseResult }> {
  const result = await Tesseract.recognize(imageDataUrl, 'eng+ind', {
    logger: () => {},
  });

  const text = result.data.text;
  const parsed = parseReceiptText(text);

  return { text, parsed };
}

export function parseReceiptText(text: string): OCRParseResult {
  const lower = text.toLowerCase();

  // Try to find amount - look for numbers after total, amount, rp, etc.
  let amount: number | null = null;

  // Match patterns like Rp 10.000, Rp10.000, Rp 10,000, 10.000 IDR, etc.
  const amountPatterns = [
    /rp\.?\s*([\d.,]+)/i,
    /total\s*[\w\s]*?([\d.,]+)/i,
    /amount\s*[\w\s]*?([\d.,]+)/i,
    /jumlah\s*[\w\s]*?([\d.,]+)/i,
    /([\d]{1,3}(?:[.,][\d]{3})+(?:[.,]\d{2})?)\s*(?:idr|rp)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const cleaned = match[1].replace(/\./g, '').replace(/,/g, '');
      const num = parseInt(cleaned, 10);
      if (!isNaN(num) && num > 0) {
        amount = num;
        break;
      }
    }
  }

  // Try to find source
  let source: string | null = null;
  for (const s of KNOWN_SOURCES) {
    if (lower.includes(s.toLowerCase())) {
      source = s;
      break;
    }
  }

  // Try to find category
  let category: string | null = null;
  for (const cat of EXPENSE_CATEGORIES) {
    if (lower.includes(cat)) {
      category = cat;
      break;
    }
  }

  // Description: first non-empty line that isn't just numbers
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const description = lines.find((l) => /[a-zA-Z]{3,}/.test(l) && !/rp|total|amount/.test(l.toLowerCase())) || null;

  return {
    amount,
    source,
    category: category || 'others',
    description,
  };
}
