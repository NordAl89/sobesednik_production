// backend/src/telegram/telegram-bot.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
  }

  async onModuleInit() {
    this.setupCommands();
    await this.launchBot();
  }

  private setupCommands() {
    // Команда /start
    this.bot.start((ctx) => {
      const username = ctx.from.username;
      const chatId = ctx.from.id;
      
      ctx.reply(
        `👋 Привет${username ? ` @${username}` : ''}! Я помощник для восстановления пароля.\n\n` +
        '🔹 **Как восстановить пароль:**\n' +
        '1️⃣ Перейдите на сайт Sobesednik\n' +
        '2️⃣ В форме восстановления введите:\n' +
        '   • Логин от вашего аккаунта\n' +
        '   • Ваш Telegram (@' + (username || 'username') + ')\n' +
        '3️⃣ Мы пришлем вам 6-значный код\n' +
        '4️⃣ Введите код на сайте для смены пароля\n\n' +
        '✅ **Бот активирован!** Теперь можно восстановить пароль.',
        { parse_mode: 'Markdown' }
      );
      
      console.log(`✅ Пользователь @${username || chatId} активировал бота`);
    });

    // Команда /help
    this.bot.help((ctx) => {
      ctx.reply(
        '📋 **Доступные команды:**\n\n' +
        '/start - Активировать бота\n' +
        '/help - Эта справка\n\n' +
        '🔐 **Восстановление пароля:**\n' +
        '1. Активируйте бота командой /start\n' +
        '2. Перейдите на сайт Sobesednik\n' +
        '3. Заполните форму восстановления\n' +
        '4. Получите код здесь\n' +
        '5. Введите код на сайте\n\n' +
        '📧 **Если не приходит код:**\n' +
        '• Убедитесь что ввели правильный @username\n' +
        '• Проверьте что бот не заблокирован\n' +
        '• Напишите "восстановить" для повторной инструкции',
        { parse_mode: 'Markdown' }
      );
    });

    // Обработка текстовых сообщений
    this.bot.on('text', (ctx) => {
      const message = ctx.message.text.toLowerCase();
      
      if (message.includes('восстановить') || 
          message.includes('пароль') || 
          message.includes('код') ||
          message.includes('сброс')) {
        const username = ctx.from.username;
        
        ctx.reply(
          '🔑 Для получения кода восстановления:\n\n' +
          '1️⃣ Перейдите на сайт: http://localhost:3000/expert-reset\n' +
          '2️⃣ Введите:\n' +
          '   • Логин вашего аккаунта\n' +
          '   • Telegram (например: @' + (username || 'username') + ')\n' +
          '3️⃣ Нажмите "Отправить код"\n' +
          '4️⃣ Код придет в этот чат\n\n' +
          '💡 Убедитесь, что вы ввели @username именно так, как указано в вашем профиле Telegram',
          { parse_mode: 'Markdown' }
        );
      }
    });
  }

  private async launchBot() {
    try {
      await this.bot.launch();
      console.log('✅ Telegram бот запущен');
      
      // Грациозное завершение
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ Ошибка запуска бота:', error.message);
      } else {
        console.error('❌ Неизвестная ошибка запуска бота:', error);
      }
    }
  }

  // Метод для отправки кода восстановления
  async sendResetCode(telegramUsername: string, code: string): Promise<boolean> {
    try {
      // Убираем @ если есть
      const username = telegramUsername.replace('@', '');
      
      // Отправляем сообщение
      await this.bot.telegram.sendMessage(
        `@${username}`,
        `🔐 **Код восстановления пароля:**\n\n` +
        `\`${code}\`\n\n` +
        `📝 **Инструкция:**\n` +
        `1. Вернитесь на сайт Sobesednik\n` +
        `2. Введите этот код в форму\n` +
        `3. Установите новый пароль\n\n` +
        `⚠️ Код действителен 10 минут\n` +
        `❓ Если вы не запрашивали восстановление, проигнорируйте это сообщение`,
        { parse_mode: 'Markdown' }
      );
      
      console.log(`✅ Код ${code} отправлен пользователю @${username}`);
      return true;
    } catch (error: unknown) {
      // Безопасное получение сообщения об ошибке
      let errorMessage = 'Неизвестная ошибка';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error(`❌ Ошибка отправки кода пользователю ${telegramUsername}:`, errorMessage);
      return false;
    }
  }

  // Метод для отправки сообщения по chat_id (если нужно)
  async sendMessageByChatId(chatId: number | string, text: string): Promise<boolean> {
    try {
      await this.bot.telegram.sendMessage(chatId, text, { parse_mode: 'Markdown' });
      console.log(`✅ Сообщение отправлено в чат ${chatId}`);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`❌ Ошибка отправки сообщения в чат ${chatId}:`, error.message);
      }
      return false;
    }
  }
}