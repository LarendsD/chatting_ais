import OpenAI from 'openai';
import { HearingModule } from '../hearing.module.js';
import { VisionModule } from '../vision.module.js';
import { VoiceModule } from '../voice.module.js';
import { Context, ContextModule } from '../context.module.js';
import { chattingPromt } from './chatting.promt.js';
import { pollingPromt } from './polling.promt.js';

interface SenderInfo {
  lastName?: string;
  firstName?: string;
  username?: string;
}

interface Message {
  text?: string;
  images?: string[];
}

interface Poll {
  question: string;
  answers: string[];
}

export class MessagingModule {
  private model = 'frob/qwen3.5-instruct';

  constructor(
    private client: OpenAI,
    private contextModule: ContextModule,
    private hearingModule: HearingModule,
    private visionModule: VisionModule,
    private voiceModule: VoiceModule,
  ) {}

  private getSenderString(senderInfo: SenderInfo): string {
    const fullname = [senderInfo.lastName, senderInfo.firstName].join(' ').trim();
    let sender = fullname;

    if (senderInfo.username) {
      sender = `${sender} (@${senderInfo.username})`;
    }

    return sender;
  }

  private getRoleFromContext(role: Context['role']): OpenAI.Responses.EasyInputMessage['role'] {
    switch (role) {
      case 'me':
        return 'assistant';
      case 'user':
        return 'user';
      default:
        throw new Error(`Unknown role ${role}!`);
    }
  }

  private getInputWithContext(
    formattedUserMessage: string,
  ): OpenAI.Responses.ResponseInputItem[] {
    const context = this.contextModule.get();

    const formattedContext: OpenAI.Responses.ResponseInput = context.map((ctx) => ({
      role: this.getRoleFromContext(ctx.role),
      type: 'message',
      content: ctx.text,
    }));

    const content: OpenAI.Responses.ResponseInputMessageContentList = [];

    content.push({
      type: 'input_text',
      text: formattedUserMessage,
    });

    return [
      ...formattedContext,
      { role: 'user', content },
    ];
  }

  private async formatUserMessage(senderInfo: SenderInfo, message: Message): Promise<string> {
    let text = '';

    if (message.text) {
      const sender = this.getSenderString(senderInfo);

      text = `[${sender}]: ${message.text}`;
    }

    if (message.images) {
      const descriptions = await this.visionModule.getImageDescriptions(message.images);

      const formattedDescriptions = descriptions.map((description) => `[Вложение: изображение]\n${description}\n[/Вложение]`);

      text = [formattedDescriptions.join('\n'), text].join('\n\n');
    }

    return text;
  }

  async getAnswer(senderInfo: SenderInfo, message: Message): Promise<Message> {
    const userMessage = await this.formatUserMessage(senderInfo, message);

    const input = this.getInputWithContext(userMessage);

    const res = await this.client.responses.create({
      model: this.model,
      instructions: chattingPromt,
      input,
      temperature: 0.7,
    });

    this.contextModule.add({
      role: 'user',
      text: userMessage,
    });

    this.contextModule.add({
      role: 'me',
      text: res.output_text,
    });

    return {
      text: res.output_text,
    };
  }

  async getRandomPoll(): Promise<Poll> {
    const response = await this.client.responses.create({
      model: 'CognitiveComputations/dolphin-llama3.1:8b',
      instructions: pollingPromt,
      input: [
        {
          role: 'user',
          type: 'message',
          content: 'Сгенерируй опрос на случайную абсурдную тему. Используй разное количество ответов от 2 до 10.',
        },
      ],
      temperature: 0.9,
    });

    const text = response.output_text;

    console.log(`Generated poll: ${text}`);

    if (!text) {
      return await this.getRandomPoll();
    }

    let result: Poll;

    try {
      result = JSON.parse(text);
    } catch {
      return await this.getRandomPoll();
    }

    return result;
  }
}
