import { InputReference } from './InputReference.type.js';

export type SaveVideoInput = {
  filename_prefix: string;
  format: string;
  codec: string;
  fps: number;
  video: InputReference;
};
