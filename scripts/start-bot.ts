import { initTelegramBot } from '../src/lib/telegram';

console.log('Starting Telegram bot...');
initTelegramBot();

process.on('SIGINT', () => {
  console.log('Stopping bot...');
  process.exit(0);
});
