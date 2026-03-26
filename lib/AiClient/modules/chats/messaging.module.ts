import OpenAI from 'openai';
import { HearingModule } from '../hearing.module.js';
import { VisionModule } from '../vision.module.js';
import { VoiceModule } from '../voice.module.js';
import { Context, ContextModule } from '../context.module.js';
import { chattingPromt } from './chatting.promt.js';
import { pollingPromt } from './polling.promt.js';
import { ReasoningModule } from '../reasoning.module.js';

interface SenderInfo {
  lastName?: string;
  firstName?: string;
  username?: string;
}

interface Message {
  id: number;
  text?: string;
  replyToMessageId?: number;
  sender: SenderInfo;
  sendDate: number;
  images?: string[];
}

interface Answer {
  message: {
    text: string;
  };
  confirm: (id: number, sendDate: number, senderInfo: SenderInfo) => void;
}

interface Poll {
  question: string;
  answers: string[];
}

export class MessagingModule {
  private model = 'sorc/qwen3.5-instruct-uncensored';

  constructor(
    private client: OpenAI,
    private contextModule: ContextModule,
    private hearingModule: HearingModule,
    private visionModule: VisionModule,
    private voiceModule: VoiceModule,
    private reasoningModule: ReasoningModule,
  ) {}

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

  private async formatUserMessage(message: Message): Promise<Message> {
    const formattedMessage = { ...message };

    if (message.images) {
      const descriptions = await this.visionModule.getImageDescriptions(message.images);

      const formattedDescriptions = descriptions.map((description) => `[Вложение: изображение]\n${description}\n[/Вложение]`);

      formattedMessage.images = formattedDescriptions;
    }

    return formattedMessage;
  }

  async getAnswer(message: Message): Promise<Answer> {
    const userMessage = await this.formatUserMessage(message);

    const stringifiedMessage = JSON.stringify(userMessage);

    const input = this.getInputWithContext(stringifiedMessage);

    const res = await this.client.responses.create({
      model: this.model,
      instructions: chattingPromt,
      input,
      temperature: 0.7,
    });

    this.contextModule.add({
      role: 'user',
      text: stringifiedMessage,
    });

    const confirm = (
      _id: number,
      _sendDate: number,
      _senderInfo: SenderInfo,
    ) => {
      /* const myMessage: Message = {
        id,
        replyToMessageId: message.id,
        sender: senderInfo,
        text: res.output_text,
        sendDate,
      }; */

      this.contextModule.add({
        role: 'me',
        text: res.output_text,
      });
    };

    return {
      message: {
        text: res.output_text,
      },
      confirm,
    };
  }

  async getRandomPoll(): Promise<Poll> {
    const response = await this.client.responses.create({
      model: this.model,
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
