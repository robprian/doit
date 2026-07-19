# Money Tracker

A modern personal money tracker with admin login, multi-source management, OCR receipt scanning, and Telegram reports.

## Features

- 🔒 Hidden admin login
- 💳 Manage sources: Banks (Mandiri, BCA, BNI, BRI), E-Money (GoPay, OVO, DANA, ShopeePay), Cash
- 📊 Daily, weekly, and monthly reports
- 📸 OCR for processing receipts and payment screenshots
- 🤖 Telegram bot for scheduled reports (daily at 00:00, weekly, monthly)
- 📱 Responsive mobile and desktop design
- 🚀 Telegram Mini App ready

## Tech Stack

- Next.js 14 + TypeScript
- Prisma + SQLite
- Tailwind CSS
- Tesseract.js (OCR)
- node-telegram-bot-api
- Recharts

## Getting Started

1. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Run database migrations:

```bash
npm run db:migrate
```

4. Seed the admin user:

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

6. (Optional) Start the Telegram bot with polling:

```bash
npx tsx scripts/start-bot.ts
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ADMIN_USERNAME` | Admin username |
| `ADMIN_PASSWORD` | Admin password |
| `JWT_SECRET` | JWT secret key |
| `TELEGRAM_BOT_TOKEN` | From @BotFather |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID |
| `APP_URL` | Deployed app URL |
| `CRON_SECRET` | Secret for cron endpoints |

## Telegram Bot Commands

- `/start` - Welcome message
- `/daily` - Daily report
- `/weekly` - Weekly report
- `/monthly` - Monthly report
- `/balance` - Current balance

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Set build command: `prisma generate && prisma migrate deploy && next build`
5. Add Vercel Cron Jobs for daily/weekly/monthly reports

### Telegram Mini App

Set your bot's Mini App URL to `https://your-app.vercel.app` in @BotFather.

## License

Private - For personal use only.
