import { InputReference } from './InputReference.type.js';

export type ADEUseEvolvedSampling = {
  model: InputReference;
  beta_schedule: string;
  m_models: InputReference;
  context_options: InputReference;
};
