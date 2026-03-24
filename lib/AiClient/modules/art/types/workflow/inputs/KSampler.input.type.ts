import { InputReference } from './InputReference.type.js';

export type KSamplerInput = {
  seed: number;
  steps: number;
  cfg: number;
  sampler_name: string;
  scheduler: string;
  denoise: number;
  positive: InputReference;
  model?: InputReference;
  negative: InputReference;
  latent_image: InputReference;
};
