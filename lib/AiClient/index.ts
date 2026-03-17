import OpenAI from 'openai';

class AIClient {
  private client: OpenAI;

  constructor(baseURL: string, apiKey: string) {
    this.client = new OpenAI({
      baseURL,
      apiKey,
    });
  }
}

export default AIClient;
