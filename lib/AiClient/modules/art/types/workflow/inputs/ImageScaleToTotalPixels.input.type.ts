import { InputReference } from './InputReference.type.js';

export type ImageScaleToTotalPixelsInput = {
  image: InputReference;
  upscale_method: 'nearest-exact' | 'bilinear' | 'area' | 'bicubic' | 'lanczos';
  megapixels: number;
  resolution_steps: number;
};
