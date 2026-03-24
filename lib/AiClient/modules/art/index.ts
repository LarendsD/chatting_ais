import axios, { AxiosInstance } from 'axios';
import OpenAI from 'openai';
import { ImageModule } from './image.module.js';
import { VideoModule } from './video.module.js';

export class ArtModule {
  private connectionInstance: AxiosInstance;
  images: ImageModule;
  videos: VideoModule;

  constructor(private client: OpenAI) {
    this.connectionInstance = axios.create({
      baseURL: process.env.COMFY_UI_URL,
    });

    this.images = new ImageModule(
      this.client,
      this.connectionInstance,
    );

    this.videos = new VideoModule(
      this.client,
      this.connectionInstance,
    );
  }
}
