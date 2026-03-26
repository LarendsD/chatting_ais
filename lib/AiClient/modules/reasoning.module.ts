import OpenAI from 'openai';
import { Context, ContextModule } from './context.module.js';

export class ReasoningModule {
  private model = 'frob/qwen3.5-instruct';

  constructor(
    private client: OpenAI,
    private context: ContextModule,
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

  async decideBool(question: string): Promise<boolean> {
    let decideInstructions = `Ты мозговой отдел большой структуры бота, твоя задача: решать различные вопросы, которые требуют только ответа "Да" или "Нет", отвечай только двумя значениями: 1 или 0`;
    decideInstructions = `${decideInstructions}\n${question}`;

    const context = this.context.get();

    const formattedContext: OpenAI.Responses.ResponseInput = context.map((ctx) => ({
      role: this.getRoleFromContext(ctx.role),
      type: 'message',
      content: ctx.text,
    }));

    const res = await this.client.responses.create({
      model: this.model,
      instructions: decideInstructions,
      temperature: 0.1,
      input: formattedContext,
    });

    console.log(res.output_text);

    const text = res.output_text;

    return text === '1';
  }
}
