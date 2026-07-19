import TelegramBot from 'node-telegram-bot-api';
import { prisma } from './prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

let bot: TelegramBot | null = null;

export function getBot(): TelegramBot | null {
  if (!token) return null;
  if (bot) return bot;

  bot = new TelegramBot(token, { polling: false });
  return bot;
}

export function initTelegramBot() {
  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN not set, bot disabled');
    return null;
  }

  if (bot) return bot;

  bot = new TelegramBot(token, { polling: true });

  bot.on('message', async (msg) => {
    const chat_id = msg.chat.id.toString();
    if (chatId && chat_id !== chatId) {
      bot?.sendMessage(chat_id, 'Unauthorized chat.');
      return;
    }

    const text = msg.text?.toLowerCase() || '';

    if (text === '/start') {
      bot?.sendMessage(chat_id, 'Welcome to Money Tracker! Use /daily, /weekly, /monthly, or /balance.');
    } else if (text === '/daily') {
      const report = await generateDailyReport();
      bot?.sendMessage(chat_id, report, { parse_mode: 'Markdown' });
    } else if (text === '/weekly') {
      const report = await generateWeeklyReport();
      bot?.sendMessage(chat_id, report, { parse_mode: 'Markdown' });
    } else if (text === '/monthly') {
      const report = await generateMonthlyReport();
      bot?.sendMessage(chat_id, report, { parse_mode: 'Markdown' });
    } else if (text === '/balance') {
      const report = await generateBalanceReport();
      bot?.sendMessage(chat_id, report, { parse_mode: 'Markdown' });
    } else {
      bot?.sendMessage(chat_id, 'Unknown command. Try /daily, /weekly, /monthly, or /balance.');
    }
  });

  console.log('Telegram bot initialized');
  return bot;
}

export async function sendTelegramMessage(text: string) {
  if (!token || !chatId) return;
  const botInstance = getBot();
  if (!botInstance) return;
  await botInstance.sendMessage(chatId, text, { parse_mode: 'Markdown' });
}

export async function generateDailyReport(date = new Date()) {
  const start = startOfDay(date);
  const end = endOfDay(date);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
    include: { source: true },
    orderBy: { date: 'desc' },
  });

  const income = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);

  let message = `📅 *Daily Report* - ${format(date, 'dd MMM yyyy')}\n\n`;
  message += `💰 Income: *Rp ${income.toLocaleString('id-ID')}*\n`;
  message += `💸 Expense: *Rp ${expense.toLocaleString('id-ID')}*\n`;
  message += `📊 Net: *Rp ${(income - expense).toLocaleString('id-ID')}*\n\n`;

  if (transactions.length === 0) {
    message += '_No transactions today._';
  } else {
    message += '*Transactions:*\n';
    transactions.forEach((t) => {
      message += `• ${t.type === 'INCOME' ? '🟢' : '🔴'} ${t.description || t.category} - Rp ${Number(t.amount).toLocaleString('id-ID')} (${t.source.name})\n`;
    });
  }

  return message;
}

export async function generateWeeklyReport(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
    include: { source: true },
    orderBy: { date: 'desc' },
  });

  const income = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);

  let message = `📆 *Weekly Report* - ${format(start, 'dd MMM')} to ${format(end, 'dd MMM yyyy')}\n\n`;
  message += `💰 Income: *Rp ${income.toLocaleString('id-ID')}*\n`;
  message += `💸 Expense: *Rp ${expense.toLocaleString('id-ID')}*\n`;
  message += `📊 Net: *Rp ${(income - expense).toLocaleString('id-ID')}*\n\n`;

  const byCategory: Record<string, number> = {};
  transactions.filter((t) => t.type === 'EXPENSE').forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
  });

  if (Object.keys(byCategory).length > 0) {
    message += '*Expenses by Category:*\n';
    Object.entries(byCategory).forEach(([cat, amount]) => {
      message += `• ${cat}: Rp ${amount.toLocaleString('id-ID')}\n`;
    });
  }

  return message;
}

export async function generateMonthlyReport(date = new Date()) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
    include: { source: true },
    orderBy: { date: 'desc' },
  });

  const income = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);

  let message = `🗓️ *Monthly Report* - ${format(date, 'MMMM yyyy')}\n\n`;
  message += `💰 Income: *Rp ${income.toLocaleString('id-ID')}*\n`;
  message += `💸 Expense: *Rp ${expense.toLocaleString('id-ID')}*\n`;
  message += `📊 Net: *Rp ${(income - expense).toLocaleString('id-ID')}*\n\n`;

  const byCategory: Record<string, number> = {};
  transactions.filter((t) => t.type === 'EXPENSE').forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
  });

  if (Object.keys(byCategory).length > 0) {
    message += '*Expenses by Category:*\n';
    Object.entries(byCategory).forEach(([cat, amount]) => {
      message += `• ${cat}: Rp ${amount.toLocaleString('id-ID')}\n`;
    });
  }

  return message;
}

export async function generateBalanceReport() {
  const sources = await prisma.source.findMany();
  const total = sources.reduce((sum, s) => sum + Number(s.balance), 0);

  let message = `💳 *Balance Report*\n\n`;
  message += `*Total Balance: Rp ${total.toLocaleString('id-ID')}*\n\n`;

  sources.forEach((s) => {
    message += `• ${s.name}: Rp ${Number(s.balance).toLocaleString('id-ID')}\n`;
  });

  return message;
}
