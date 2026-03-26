import OpenAI from 'openai';
import { ChatsModule } from './modules/chats/index.js';
import { HearingModule } from './modules/hearing.module.js';
import { HeartbeatModule } from './modules/heartbeat.module.js';
import { ContextModule } from './modules/context.module.js';
import { VisionModule } from './modules/vision.module.js';
import { VoiceModule } from './modules/voice.module.js';
import { ArtModule } from './modules/art/index.js';
import { ReasoningModule } from './modules/reasoning.module.js';

class AIClient {
  private client: OpenAI;
  chats: ChatsModule;
  art: ArtModule;

  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.OPEN_AI_URL,
      apiKey: process.env.OPEN_AI_API_KEY,
    });

    const hearing = new HearingModule();
    new HeartbeatModule(this.client);
    const context = new ContextModule();
    const vision = new VisionModule(this.client);
    const voice = new VoiceModule();
    const reasoning = new ReasoningModule(this.client, context);

    this.chats = new ChatsModule(
      this.client,
      context,
      hearing,
      vision,
      voice,
      reasoning,
    );

    this.art = new ArtModule(this.client);
  }
}

export default AIClient;
