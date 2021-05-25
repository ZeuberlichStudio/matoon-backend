const TelegramBot = require('node-telegram-bot-api');

const mode = process.env.NODE_ENV || 'production';

require('dotenv').config({ 
    path: require('path').resolve(__dirname, '../..', mode == 'production' ? '.env' : '.env.dev')
});

const bot = new TelegramBot(process.env.TG_TOKEN, {polling: true});

module.exports = bot;