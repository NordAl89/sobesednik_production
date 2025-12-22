// backend/src/telegram/telegram.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly apiBase: string;

  constructor() {
    // Токен бота нужно добавить в .env
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.apiBase = `https://api.telegram.org/bot${this.botToken}`;
    this.startPolling();
  }

  async startPolling() {
  try {
    this.logger.log('🚀 Telegram polling started');

    // дергаем getUpdates каждые 2 секунды
    setInterval(async () => {
      try {
        await fetch(`${this.apiBase}/getUpdates`);
      } catch (e) {
        this.logger.error('Polling error', e);
      }
    }, 2000);

  } catch (e) {
    this.logger.error('❌ Failed to start polling', e);
  }
}


  async getChatIdByUsername(username: string): Promise<number | null> {
  if (!username) return null;

  // Убираем @
  username = username.replace('@', '');

  try {
    const response = await fetch(`${this.apiBase}/getUpdates`);
    const data = await response.json();

    if (!data.ok) return null;

    for (const upd of data.result) {
      const from = upd.message?.from;
      if (from?.username?.toLowerCase() === username.toLowerCase()) {
        return from.id;
      }
    }

    return null;
  } catch (e) {
    this.logger.error('Ошибка getChatIdByUsername', e);
    return null;
  }
}

  async sendMessage(chatIdOrUsername: string, text: string): Promise<void> {
  if (!this.botToken) {
    this.logger.warn('⚠️ Telegram Bot Token не указан');
    return;
  }

  try {
    let chatId = chatIdOrUsername;
    
    // Если передан username (начинается с @), пытаемся получить chat_id
    if (chatIdOrUsername.startsWith('@')) {
      const foundChatId = await this.getChatIdByUsername(chatIdOrUsername);
      if (!foundChatId) {
        this.logger.error(`❌ Не удалось найти chat_id для ${chatIdOrUsername}`);
        throw new Error(`Пользователь ${chatIdOrUsername} должен сначала написать боту`);
      }
      chatId = foundChatId.toString();
    }

    const response = await fetch(`${this.apiBase}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка Telegram API: ${errorText}`);
    }

    this.logger.log(`✅ Сообщение отправлено в Telegram: ${chatId}`);
  } catch (error) {
    this.logger.error('❌ Ошибка отправки Telegram-сообщения', error);
    // Пробрасываем ошибку дальше, чтобы фронтенд мог ее обработать
    throw error;
  }
}

  async sendToUsername(username: string, text: string): Promise<void> {
  const chatId = await this.getChatIdByUsername(username);

  if (!chatId) {
    this.logger.error(
      `❌ Не могу отправить сообщение ${username}. Он должен сначала написать боту.`
    );
    return;
  }

  return this.sendMessage(chatId.toString(), text);
}
}


