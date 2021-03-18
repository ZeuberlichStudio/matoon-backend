import TelegramBot from 'node-telegram-bot-api';

const token = '1438088320:AAEV-lDy1y_pHHYBMMk75YAunrr7Rx2wu8o';

const bot = new TelegramBot(token, {polling: true});

module.exports = bot;