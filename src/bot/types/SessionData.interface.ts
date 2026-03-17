import BotMessagingMode from '../enums/botMessagingMode.js';

interface SessionData {
  messagingMode: BotMessagingMode;
  imageContext?: {
    imageFilename: string; // Имя файла изображения в ComfyUI
    keywords: string; // Ключевые слова для добавления в промпт
  };
}

export default SessionData;
