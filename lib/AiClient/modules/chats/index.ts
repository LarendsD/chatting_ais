import OpenAI from 'openai';
import { HearingModule } from '../hearing.module.js';
import { VisionModule } from '../vision.module.js';
import { writeFileSync } from 'fs';
import { VoiceModule } from '../voice.module.js';
import { MessagingModule } from './messaging.module.js';
import { ContextModule } from '../context.module.js';
import { ReasoningModule } from '../reasoning.module.js';

export class ChatsModule {
  private contextPath = 'context.json';
  messaging: MessagingModule;

  constructor(
    private client: OpenAI,
    private contextModule: ContextModule,
    private hearingModule: HearingModule,
    private visionModule: VisionModule,
    private voiceModule: VoiceModule,
    private reasoningModule: ReasoningModule,
  ) {
    this.messaging = new MessagingModule(
      this.client,
      this.contextModule,
      this.hearingModule,
      this.visionModule,
      this.voiceModule,
      this.reasoningModule,
    );
  }

  new() {
    writeFileSync(this.contextPath, JSON.stringify([]));
  }

  clear() {
    this.contextModule.clear();
  }
}
