import OpenAI from 'openai';

export class HeartbeatModule {
  private client: OpenAI;

  constructor(client: OpenAI) {
    this.client = client;

    setInterval(async () => {
      await this.ping();
    }, 5000);
  }

  private async ping() {
    try {
      await this.client.models.list();
    } catch (error) {
      throw error;
    }
  }
}
