import { InputReference } from './InputReference.type.js';

export type ADEApplyAnimateDiffModelSimple = {
  motion_model: InputReference;
  start_percent: number;
  end_percent: number;
  scale_multival: number | null;
  effect_multival: number | null;
  ad_keyframes: number | null;
  prev_m_models: number | null;
  per_block: number | null;
};
