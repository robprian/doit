# Money Tracker

A modern personal money tracker with admin login, multi-source management, OCR receipt scanning, and Telegram reports.

## Features

- 🔒 Hidden admin login with JWT
- 💳 Manage sources: Banks (Mandiri, BCA, BNI, BRI), E-Money (GoPay, OVO, DANA, ShopeePay), Cash
- 📊 Daily, weekly, and monthly reports
- 📸 OCR for processing receipts and payment screenshots
- 🤖 Telegram bot for scheduled reports (daily at 00:00, weekly, monthly)
- 📱 Responsive mobile and desktop design
- 🚀 Telegram Mini App ready

## Tech Stack

- [Next.js 14](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/) + SQLite
- [Tailwind CSS](https://tailwindcss.com/)
- [Tesseract.js](https://tesseract.projectnaptha.com/) (OCR)
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [Recharts](https://recharts.org/)

## Prerequisites

- Node.js 20+
- npm 10+

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/robprian/doit.git
 cd doit
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

See the [Environment Variables](#environment-variables) section below for details.

### 4. Set up the database

Generate the Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Seed the database

Create the default admin user:

```bash
npm run db:seed
```

By default, the seed creates an admin with:

- Username: `admin`
- Password: `admin123`

Change these in `.env` before running the seed. You will use these credentials to log in at `/login`.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. (Optional) Start the Telegram bot

```bash
npx tsx scripts/start-bot.ts
```

## Environment Variables

| Variable | Required for core | Required for Telegram/cron | Description |
|----------|-------------------|----------------------------|-------------|
| `DATABASE_URL` | Yes | Yes | SQLite database URL. Default: `file:./dev.db` |
| `JWT_SECRET` | Yes | Yes | Secret key used to sign JWT tokens. Generate a strong random string. |
| `ADMIN_USERNAME` | Yes | Yes | Admin username for the hidden login. |
| `ADMIN_PASSWORD` | Yes | Yes | Admin password. Use a strong password in production. |
| `TELEGRAM_BOT_TOKEN` | No | Yes | Token from [@BotFather](https://t.me/BotFather). |
| `TELEGRAM_CHAT_ID` | No | Yes | Your Telegram chat ID. |
| `APP_URL` | No | Yes | Deployed app URL (e.g., `https://your-app.vercel.app`). Used for Telegram Mini App and webhooks. |
| `CRON_SECRET` | No | Yes | Secret token for securing cron/report endpoints. |

### Example `.env`

```env
# Admin credentials (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# JWT secret (generate a strong random string)
JWT_SECRET=your_jwt_secret_here

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id
APP_URL=https://your-app.vercel.app

# Database
DATABASE_URL="file:./dev.db"

# Cron security
CRON_SECRET=your_cron_secret_here
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the database with the default admin user |

## Telegram Bot Commands

- `/start` - Welcome message
- `/daily` - Daily report
- `/weekly` - Weekly report
- `/monthly` - Monthly report
- `/balance` - Current balance

## Deployment

### Vercel

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. Add all required environment variables in the Vercel dashboard.
4. Set the build command to:

   ```bash
   prisma generate && prisma migrate deploy && next build
   ```

5. Add Vercel Cron Jobs for daily, weekly, and monthly reports, using `/api/cron/reports?secret=<CRON_SECRET>` (replace `<CRON_SECRET>` with the value from your environment variables).

### Telegram Mini App

Set your bot's Mini App URL to your deployed app URL (e.g., `https://your-app.vercel.app`) in [@BotFather](https://t.me/BotFather).

## CI/CD

This project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs lint, type-check, and build on every push and pull request to `main` or `master`.

## Project Structure

```
.
├── prisma/              # Prisma schema and seed script
├── public/              # Static assets
├── scripts/             # Utility scripts (e.g., Telegram bot)
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   ├── components/      # React components
│   └── lib/             # Utilities, Prisma client, auth, OCR, Telegram
├── .env.example         # Example environment variables
├── next.config.js       # Next.js configuration
├── package.json         # Project dependencies and scripts
└── README.md            # This file
```

## License

Private - For personal use only.
